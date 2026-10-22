from django.urls import path

from .views import ContactMessageNotFoundView, ContactSubmissionView

urlpatterns = [
    path('', ContactSubmissionView.as_view(), name='contact-submit'),
    path('<int:pk>/', ContactMessageNotFoundView.as_view(), name='contact-message-not-found'),
]
