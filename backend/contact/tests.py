import json
from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import DatabaseError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContactMessage
from .throttles import ContactSubmissionThrottle


class ContactSubmissionAPITests(APITestCase):
    endpoint = '/api/contact/'

    def valid_payload(self, **overrides):
        payload = {
            'name': 'Example Visitor',
            'email': 'visitor@example.invalid',
            'subject': 'Portfolio enquiry',
            'message': 'I would like to discuss a project.',
        }
        payload.update(overrides)
        return payload

    def test_valid_submission_returns_generic_confirmation_and_saves_new_message(self):
        response = self.client.post(
            self.endpoint,
            self.valid_payload(),
            format='json',
            REMOTE_ADDR='192.0.2.10',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {'detail': 'Your message has been received.'})
        self.assertEqual(ContactMessage.objects.count(), 1)
        saved = ContactMessage.objects.get()
        self.assertEqual(saved.name, 'Example Visitor')
        self.assertEqual(saved.email, 'visitor@example.invalid')
        self.assertEqual(saved.status, ContactMessage.Status.NEW)
        self.assertNotIn('email', response.data)
        self.assertNotIn('message', response.data)

    def test_missing_required_fields_return_field_errors(self):
        response = self.client.post(
            self.endpoint, {}, format='json', REMOTE_ADDR='192.0.2.11'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            set(response.data), {'name', 'email', 'subject', 'message'}
        )
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_invalid_email_returns_a_field_error(self):
        response = self.client.post(
            self.endpoint,
            self.valid_payload(email='not-an-email'),
            format='json',
            REMOTE_ADDR='192.0.2.12',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_empty_and_oversized_fields_are_rejected(self):
        empty = self.client.post(
            self.endpoint,
            self.valid_payload(name='  ', message='  '),
            format='json',
            REMOTE_ADDR='192.0.2.13',
        )
        oversized = self.client.post(
            self.endpoint,
            self.valid_payload(message='x' * 5001),
            format='json',
            REMOTE_ADDR='192.0.2.14',
        )

        self.assertEqual(empty.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', empty.data)
        self.assertIn('message', empty.data)
        self.assertEqual(oversized.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', oversized.data)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_request_body_over_limit_returns_413(self):
        body = json.dumps({'unrecognized': 'x' * 17000}).encode('utf-8')

        response = self.client.generic(
            'POST',
            self.endpoint,
            body,
            content_type='application/json',
            REMOTE_ADDR='192.0.2.15',
        )

        self.assertEqual(response.status_code, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_filled_honeypot_is_rejected_without_saving(self):
        response = self.client.post(
            self.endpoint,
            self.valid_payload(website='spam.example'),
            format='json',
            REMOTE_ADDR='192.0.2.16',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('website', response.data)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_database_failure_returns_generic_json_without_details(self):
        with patch(
            'contact.views.ContactMessageSerializer.save',
            side_effect=DatabaseError('sensitive database detail'),
        ):
            response = self.client.post(
                self.endpoint,
                self.valid_payload(),
                format='json',
                REMOTE_ADDR='192.0.2.21',
            )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(
            response.data,
            {'detail': 'Unable to process your submission right now.'},
        )
        self.assertNotIn('sensitive database detail', str(response.data))

    def test_public_client_cannot_set_status(self):
        response = self.client.post(
            self.endpoint,
            self.valid_payload(status='replied'),
            format='json',
            REMOTE_ADDR='192.0.2.17',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_anonymous_contact_submissions_are_throttled_by_scope(self):
        cache.clear()
        self.addCleanup(cache.clear)

        with patch.object(
            ContactSubmissionThrottle,
            'THROTTLE_RATES',
            {'contact_submission': '1/day'},
        ):
            first = self.client.post(
                self.endpoint,
                self.valid_payload(),
                format='json',
                REMOTE_ADDR='192.0.2.18',
            )
            second = self.client.post(
                self.endpoint,
                self.valid_payload(),
                format='json',
                REMOTE_ADDR='192.0.2.18',
            )

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_public_clients_cannot_list_or_retrieve_messages(self):
        listed = self.client.get(self.endpoint, REMOTE_ADDR='192.0.2.19')
        retrieved = self.client.get(
            f'{self.endpoint}1/', REMOTE_ADDR='192.0.2.19'
        )

        self.assertEqual(listed.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(retrieved.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(retrieved['Content-Type'], 'application/json')
        self.assertEqual(retrieved.data, {'detail': 'Not found.'})
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_public_clients_cannot_update_or_delete_messages(self):
        for method in ('put', 'patch', 'delete'):
            with self.subTest(method=method):
                response = getattr(self.client, method)(
                    self.endpoint,
                    self.valid_payload(),
                    format='json',
                    REMOTE_ADDR='192.0.2.20',
                )
                self.assertEqual(
                    response.status_code,
                    status.HTTP_405_METHOD_NOT_ALLOWED,
                )


class ContactMessageAdminTests(TestCase):
    def test_contact_message_admin_registration_and_options(self):
        self.assertIn(ContactMessage, admin.site._registry)
        message_admin = admin.site._registry[ContactMessage]
        self.assertEqual(
            message_admin.list_display,
            ('name', 'email', 'subject', 'status', 'created_at'),
        )
        self.assertEqual(message_admin.list_filter, ('status', 'created_at'))
        self.assertEqual(message_admin.readonly_fields, ('created_at',))

    def test_admin_login_can_review_contact_messages(self):
        user_model = get_user_model()
        admin_user = user_model.objects.create_superuser(
            username='contact-admin-test',
            email='admin@example.com',
            password='test-only-password',
        )
        self.client.force_login(admin_user)

        response = self.client.get(
            reverse('admin:contact_contactmessage_changelist')
        )

        self.assertEqual(response.status_code, 200)
