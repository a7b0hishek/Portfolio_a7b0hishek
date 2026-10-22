from django.contrib import admin
from django.db.models import TextField
from django.db.models.functions import Cast

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'featured', 'created_at', 'updated_at')
    list_filter = ('featured', 'created_at')
    search_fields = ('title', 'short_description', 'description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at', '-pk')
    list_per_page = 25
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Project details', {
            'fields': ('title', 'slug', 'short_description', 'description', 'featured'),
        }),
        ('Links', {'fields': ('github_url', 'live_url', 'image_url')}),
        ('Technologies', {'fields': ('tech_stack',)}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )

    def get_search_results(self, request, queryset, search_term):
        results, may_have_duplicates = super().get_search_results(
            request, queryset, search_term
        )
        if not search_term:
            return results, may_have_duplicates

        # Casting JSONField to text keeps technology search portable across
        # PostgreSQL and the SQLite development fallback.
        technology_matches = queryset.alias(
            tech_stack_text=Cast('tech_stack', output_field=TextField())
        ).filter(tech_stack_text__icontains=search_term)
        return results | technology_matches, may_have_duplicates
