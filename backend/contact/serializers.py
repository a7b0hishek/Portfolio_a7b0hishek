from rest_framework import serializers

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    # A blank honeypot field is harmless for legitimate clients. Filled values
    # are rejected and never persisted.
    website = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=200,
    )

    class Meta:
        model = ContactMessage
        fields = ('name', 'email', 'subject', 'message', 'website')
        extra_kwargs = {
            'name': {'max_length': 100, 'trim_whitespace': True},
            'email': {'max_length': 254},
            'subject': {'max_length': 200, 'trim_whitespace': True},
            'message': {'max_length': 5000, 'trim_whitespace': True},
        }

    def to_internal_value(self, data):
        if hasattr(data, 'keys'):
            unknown_fields = set(data.keys()) - set(self.fields)
            if unknown_fields:
                raise serializers.ValidationError({
                    field: ['Unknown or unsupported field.']
                    for field in sorted(unknown_fields)
                })
        return super().to_internal_value(data)

    def validate(self, attrs):
        website = attrs.pop('website', '')
        if website.strip():
            raise serializers.ValidationError({
                'website': ['Leave this field blank.'],
            })
        return attrs
