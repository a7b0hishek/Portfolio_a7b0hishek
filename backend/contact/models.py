from django.core.exceptions import ValidationError
from django.db import models


def validate_non_blank(value):
    if not value.strip():
        raise ValidationError('This field cannot contain only whitespace.')


class ContactMessage(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        READ = 'read', 'Read'
        REPLIED = 'replied', 'Replied'

    name = models.CharField(max_length=100, validators=[validate_non_blank])
    email = models.EmailField(max_length=254)
    subject = models.CharField(max_length=200, validators=[validate_non_blank])
    message = models.TextField(max_length=5000, validators=[validate_non_blank])
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.NEW,
    )

    class Meta:
        ordering = ('-created_at', '-pk')
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=('new', 'read', 'replied')),
                name='contact_message_valid_status',
            ),
        ]

    def clean(self):
        super().clean()
        errors = {}
        for field_name in ('name', 'email', 'subject', 'message'):
            value = getattr(self, field_name)
            normalized = value.strip() if value else ''
            setattr(self, field_name, normalized)
            if not normalized:
                errors[field_name] = 'This field cannot be blank.'
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'{self.subject} from {self.name}'
