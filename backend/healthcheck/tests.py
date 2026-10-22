from django.test import TestCase
from django.urls import reverse


class HealthCheckTests(TestCase):
    def test_health_endpoint_returns_ok_json(self):
        response = self.client.get(reverse('health'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})


class CORSPolicyTests(TestCase):
    def test_configured_frontend_origin_can_read_api_responses(self):
        response = self.client.get(
            '/api/projects/',
            HTTP_ORIGIN='http://localhost:5173',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get('Access-Control-Allow-Origin'),
            'http://localhost:5173',
        )

    def test_unlisted_origin_does_not_receive_cors_access(self):
        response = self.client.get(
            '/api/projects/',
            HTTP_ORIGIN='https://untrusted.invalid',
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn('Access-Control-Allow-Origin', response.headers)

    def test_cors_policy_does_not_apply_to_health_endpoint(self):
        response = self.client.get(
            reverse('health'),
            HTTP_ORIGIN='http://localhost:5173',
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn('Access-Control-Allow-Origin', response.headers)
