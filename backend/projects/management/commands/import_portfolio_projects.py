import json
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import DatabaseError, IntegrityError, transaction
from django.utils.text import slugify

from projects.models import Project


REQUIRED_FIELDS = {
    'title',
    'slug',
    'short_description',
    'description',
    'tech_stack',
}
OPTIONAL_FIELDS = {'github_url', 'live_url', 'image_url', 'featured'}
ALLOWED_FIELDS = REQUIRED_FIELDS | OPTIONAL_FIELDS


class Command(BaseCommand):
    help = 'Import or update portfolio projects from JSON without deleting records.'

    def add_arguments(self, parser):
        parser.add_argument(
            'json_file',
            type=Path,
            help='Path to a JSON file containing a projects list.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Validate and report planned changes without writing to the database.',
        )

    def handle(self, *args, **options):
        source_path = options['json_file']
        dry_run = options['dry_run']
        try:
            with source_path.open(encoding='utf-8') as source:
                payload = json.load(source)
        except OSError as exc:
            raise CommandError(f'Could not read JSON file: {exc.strerror or exc}') from exc
        except json.JSONDecodeError as exc:
            raise CommandError(
                f'Invalid JSON at line {exc.lineno}, column {exc.colno}.'
            ) from exc

        if not isinstance(payload, dict) or set(payload) != {'projects'}:
            raise CommandError('The JSON root must be an object containing only a "projects" list.')
        if not isinstance(payload['projects'], list):
            raise CommandError('The "projects" value must be a list.')

        counts = {'imported': 0, 'updated': 0, 'skipped': 0, 'failed': 0}
        for index, record in enumerate(payload['projects'], start=1):
            try:
                result = self._process_record(record, dry_run=dry_run)
            except ValidationError as exc:
                counts['failed'] += 1
                fields = ', '.join(sorted(exc.message_dict)) if hasattr(exc, 'message_dict') else 'record'
                self.stderr.write(f'Record {index} failed validation ({fields}).')
            except (TypeError, ValueError) as exc:
                counts['failed'] += 1
                self.stderr.write(f'Record {index} failed validation ({exc}).')
            except (IntegrityError, DatabaseError):
                counts['failed'] += 1
                self.stderr.write(f'Record {index} failed during database save.')
            else:
                counts[result] += 1
                outcome = f'would be {result}' if dry_run else result
                self.stdout.write(f'Record {index}: {outcome}.')

        action = 'Dry run' if dry_run else 'Import'
        self.stdout.write(
            f'{action} summary: imported={counts["imported"]}, '
            f'updated={counts["updated"]}, skipped={counts["skipped"]}, '
            f'failed={counts["failed"]}.'
        )

    def _process_record(self, record, *, dry_run):
        if not isinstance(record, dict):
            raise TypeError('each project must be a JSON object')
        unknown = set(record) - ALLOWED_FIELDS
        if unknown:
            raise TypeError('unknown fields: ' + ', '.join(sorted(unknown)))
        missing = REQUIRED_FIELDS - set(record)
        if missing:
            raise TypeError('missing required fields: ' + ', '.join(sorted(missing)))

        for name in ('title', 'slug', 'short_description', 'description'):
            if not isinstance(record[name], str) or not record[name].strip():
                raise TypeError(f'{name} must be a non-empty string')
        if slugify(record['slug']) != record['slug']:
            raise TypeError('slug must be a normalized URL-safe slug')
        if not isinstance(record['tech_stack'], list) or any(
            not isinstance(item, str) or not item.strip()
            for item in record['tech_stack']
        ):
            raise TypeError('tech_stack must be a list of non-empty strings')
        for name in ('github_url', 'live_url', 'image_url'):
            if name in record and not isinstance(record[name], str):
                raise TypeError(f'{name} must be a string')
        if 'featured' in record and not isinstance(record['featured'], bool):
            raise TypeError('featured must be a boolean')

        values = dict(record)
        with transaction.atomic():
            existing = Project.objects.filter(slug=record['slug']).first()
            project = existing or Project()
            before = {field: getattr(project, field) for field in values} if existing else {}

            if not existing:
                values.setdefault('github_url', '')
                values.setdefault('live_url', '')
                values.setdefault('image_url', '')
                values.setdefault('featured', False)
            for field, value in values.items():
                setattr(project, field, value)

            project.full_clean()
            if existing:
                changed = [field for field, value in values.items() if before[field] != value]
                if not changed:
                    return 'skipped'
                if not dry_run:
                    project.save()
                return 'updated'

            if not dry_run:
                project.save()
            return 'imported'
