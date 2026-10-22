from django.core.exceptions import ValidationError
from django.db import IntegrityError, models, transaction
from django.db.models import Q
from django.utils.text import slugify


def validate_non_blank(value):
    if not value.strip():
        raise ValidationError('This field cannot contain only whitespace.')


def validate_tech_stack(value):
    if not isinstance(value, list):
        raise ValidationError('Tech stack must be a list of technology names.')
    if any(not isinstance(item, str) or not item.strip() for item in value):
        raise ValidationError('Each technology name must be a non-empty string.')


class Project(models.Model):
    title = models.CharField(max_length=200, validators=[validate_non_blank])
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(
        max_length=280,
        validators=[validate_non_blank],
    )
    description = models.TextField(validators=[validate_non_blank])
    tech_stack = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_tech_stack],
    )
    github_url = models.URLField(max_length=2048, blank=True)
    live_url = models.URLField(max_length=2048, blank=True)
    image_url = models.URLField(max_length=2048, blank=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at', '-pk')
        constraints = [
            models.CheckConstraint(
                condition=~Q(title=''),
                name='projects_title_not_empty',
            ),
            models.CheckConstraint(
                condition=~Q(slug=''),
                name='projects_slug_not_empty',
            ),
            models.CheckConstraint(
                condition=~Q(short_description=''),
                name='projects_summary_not_empty',
            ),
            models.CheckConstraint(
                condition=~Q(description=''),
                name='projects_description_not_empty',
            ),
        ]

    def clean(self):
        super().clean()
        errors = {}
        for field_name in ('title', 'short_description', 'description'):
            value = getattr(self, field_name)
            normalized = value.strip() if value else ''
            setattr(self, field_name, normalized)
            if not normalized:
                errors[field_name] = 'This field cannot be blank.'

        if isinstance(self.tech_stack, list):
            self.tech_stack = [
                item.strip() if isinstance(item, str) else item
                for item in self.tech_stack
            ]

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        base_slug = slugify(self.slug or self.title) or 'project'
        slug_limit = self._meta.get_field('slug').max_length
        suffix_number = 1

        while True:
            suffix = '' if suffix_number == 1 else f'-{suffix_number}'
            candidate = f'{base_slug[:slug_limit - len(suffix)].rstrip("-")}{suffix}'
            self.slug = candidate
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError:
                duplicate_slug = type(self).objects.filter(slug=candidate).exclude(
                    pk=self.pk
                ).exists()
                if not duplicate_slug:
                    raise
                suffix_number += 1

    def __str__(self):
        return self.title
