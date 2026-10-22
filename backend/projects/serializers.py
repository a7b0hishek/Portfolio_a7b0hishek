from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    tech_stack = serializers.JSONField(read_only=True)

    class Meta:
        model = Project
        fields = (
            'id',
            'title',
            'slug',
            'short_description',
            'description',
            'tech_stack',
            'github_url',
            'live_url',
            'image_url',
            'featured',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields
