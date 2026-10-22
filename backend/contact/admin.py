from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at',)
    ordering = ('-created_at', '-pk')
    list_per_page = 25
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Submission', {'fields': ('name', 'email', 'subject', 'message')}),
        ('Review', {'fields': ('status',)}),
        ('Metadata', {'fields': ('created_at',)}),
    )
