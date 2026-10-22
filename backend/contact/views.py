import logging

from django.db import DatabaseError
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactMessageSerializer
from .throttles import ContactSubmissionThrottle


MAX_REQUEST_BYTES = 16 * 1024
logger = logging.getLogger(__name__)


class ContactSubmissionView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ContactSubmissionThrottle,)
    parser_classes = (JSONParser,)
    renderer_classes = (JSONRenderer,)

    def post(self, request, *args, **kwargs):
        content_length = request.META.get('CONTENT_LENGTH')
        try:
            request_size = int(content_length) if content_length else 0
        except (TypeError, ValueError):
            return Response(
                {'detail': 'Content-Length must be a valid integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request_size > MAX_REQUEST_BYTES:
            return Response(
                {'detail': 'Request body must not exceed 16384 bytes.'},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
        except DatabaseError:
            logger.exception('Contact submission could not be stored.')
            return Response(
                {'detail': 'Unable to process your submission right now.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            {'detail': 'Your message has been received.'},
            status=status.HTTP_201_CREATED,
        )


class ContactMessageNotFoundView(APIView):
    """Return a JSON 404 without exposing stored messages or debug pages."""

    permission_classes = (AllowAny,)
    renderer_classes = (JSONRenderer,)

    def get(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )
