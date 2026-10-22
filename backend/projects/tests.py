from datetime import timedelta
import json
from pathlib import Path
import tempfile
from io import StringIO

from django.contrib import admin
from django.core.exceptions import ValidationError
from django.core.management import call_command, CommandError
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Project


class ProjectAPITests(APITestCase):
    def create_project(self, title, **overrides):
        fields = {
            'title': title,
            'short_description': f'{title} summary',
            'description': f'Detailed information about {title}.',
            'tech_stack': ['Django', 'PostgreSQL'],
        }
        fields.update(overrides)
        return Project.objects.create(**fields)

    def test_empty_project_list_is_paginated_json(self):
        response = self.client.get('/api/projects/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertEqual(response.data, {
            'count': 0,
            'next': None,
            'previous': None,
            'results': [],
        })

    def test_project_list_serializes_fields_and_orders_newest_first(self):
        older = self.create_project('Older Project')
        newer = self.create_project(
            'Newer Project',
            github_url='https://github.com/example/newer',
            live_url='https://newer.example.com',
            image_url='https://images.example.com/newer.png',
            featured=True,
        )
        Project.objects.filter(pk=older.pk).update(
            created_at=timezone.now() - timedelta(days=1)
        )

        response = self.client.get('/api/projects/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [project['slug'] for project in response.data['results']],
            [newer.slug, older.slug],
        )
        self.assertEqual(response.data['results'][0], {
            'id': newer.pk,
            'title': 'Newer Project',
            'slug': 'newer-project',
            'short_description': 'Newer Project summary',
            'description': 'Detailed information about Newer Project.',
            'tech_stack': ['Django', 'PostgreSQL'],
            'github_url': 'https://github.com/example/newer',
            'live_url': 'https://newer.example.com',
            'image_url': 'https://images.example.com/newer.png',
            'featured': True,
            'created_at': newer.created_at.isoformat().replace('+00:00', 'Z'),
            'updated_at': newer.updated_at.isoformat().replace('+00:00', 'Z'),
        })

    def test_project_detail_returns_project_by_slug(self):
        project = self.create_project('Detail Project', featured=True)

        response = self.client.get(f'/api/projects/{project.slug}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertEqual(response.data['slug'], project.slug)
        self.assertEqual(response.data['title'], project.title)
        self.assertEqual(response.data['tech_stack'], ['Django', 'PostgreSQL'])

    def test_featured_endpoint_returns_only_featured_projects(self):
        featured = self.create_project('Featured Project', featured=True)
        self.create_project('Regular Project', featured=False)

        response = self.client.get('/api/projects/featured/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], featured.slug)

    def test_invalid_slug_returns_json_not_found(self):
        response = self.client.get('/api/projects/not a valid slug/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response['Content-Type'], 'application/json')

    def test_nonexistent_slug_returns_json_not_found(self):
        response = self.client.get('/api/projects/does-not-exist/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response['Content-Type'], 'application/json')

    def test_project_list_supports_page_size_and_page_number(self):
        projects = [self.create_project(f'Project {number}') for number in range(5)]

        first_page = self.client.get('/api/projects/?page_size=2')
        second_page = self.client.get('/api/projects/?page_size=2&page=2')

        self.assertEqual(first_page.status_code, status.HTTP_200_OK)
        self.assertEqual(first_page.data['count'], 5)
        self.assertEqual(len(first_page.data['results']), 2)
        self.assertIsNotNone(first_page.data['next'])
        self.assertEqual(len(second_page.data['results']), 2)
        self.assertEqual(
            {item['slug'] for item in first_page.data['results']}
            & {item['slug'] for item in second_page.data['results']},
            set(),
        )
        self.assertEqual(len(projects), 5)

    def test_project_api_is_read_only(self):
        response = self.client.post('/api/projects/', {'title': 'Not allowed'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class ProjectModelTests(TestCase):
    def project_fields(self, **overrides):
        fields = {
            'title': 'Café & Code',
            'short_description': 'A concise summary',
            'description': 'A detailed project description.',
            'tech_stack': ['Django', 'PostgreSQL'],
        }
        fields.update(overrides)
        return fields

    def test_generated_slugs_are_safe_and_unique(self):
        first = Project.objects.create(**self.project_fields())
        second = Project.objects.create(**self.project_fields())
        fallback = Project.objects.create(**self.project_fields(title='!!!'))

        self.assertEqual(first.slug, 'cafe-code')
        self.assertEqual(second.slug, 'cafe-code-2')
        self.assertEqual(fallback.slug, 'project')

    def test_tech_stack_validation_requires_nonempty_strings(self):
        project = Project(**self.project_fields(tech_stack=['Django', '  ']))

        with self.assertRaises(ValidationError):
            project.full_clean()

    def test_required_text_validation_rejects_whitespace(self):
        project = Project(**self.project_fields(title='   '))

        with self.assertRaises(ValidationError):
            project.full_clean()


class ProjectAdminTests(TestCase):
    def test_project_is_registered_with_admin_management_options(self):
        self.assertIn(Project, admin.site._registry)
        project_admin = admin.site._registry[Project]

        self.assertEqual(
            project_admin.list_display,
            ('title', 'slug', 'featured', 'created_at', 'updated_at'),
        )
        self.assertEqual(project_admin.list_filter, ('featured', 'created_at'))
        self.assertEqual(project_admin.readonly_fields, ('created_at', 'updated_at'))
        self.assertEqual(project_admin.prepopulated_fields, {'slug': ('title',)})
        self.assertEqual(project_admin.list_per_page, 25)

    def test_project_admin_searches_json_technology_stack(self):
        project = Project.objects.create(
            title='Admin Search Project',
            short_description='A project for admin search.',
            description='Search technologies stored in JSON.',
            tech_stack=['Django', 'PostgreSQL'],
        )
        project_admin = admin.site._registry[Project]

        results, _ = project_admin.get_search_results(
            None, Project.objects.all(), 'PostgreSQL'
        )

        self.assertEqual(list(results), [project])


class ProjectImportCommandTests(TestCase):
    def project_data(self, **overrides):
        record = {
            'title': 'Imported Project',
            'slug': 'imported-project',
            'short_description': 'An imported project summary.',
            'description': 'An imported project description.',
            'tech_stack': ['Django'],
            'github_url': '',
            'live_url': '',
            'image_url': '',
            'featured': False,
        }
        record.update(overrides)
        return record

    def run_import(self, payload, *args):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        path = Path(temporary.name) / 'projects.json'
        path.write_text(json.dumps(payload), encoding='utf-8')
        output = StringIO()
        call_command('import_portfolio_projects', str(path), *args, stdout=output)
        return output.getvalue()

    def test_json_import_creates_a_project(self):
        output = self.run_import({'projects': [self.project_data()]})

        self.assertEqual(Project.objects.count(), 1)
        project = Project.objects.get(slug='imported-project')
        self.assertEqual(project.title, 'Imported Project')
        self.assertEqual(project.tech_stack, ['Django'])
        self.assertIn('imported=1, updated=0, skipped=0, failed=0', output)

    def test_import_updates_same_slug_without_creating_duplicate(self):
        existing = Project.objects.create(
            title='Old title',
            slug='imported-project',
            short_description='Old summary',
            description='Old description',
            tech_stack=[],
        )
        payload_record = self.project_data(title='Updated title')

        output = self.run_import({'projects': [payload_record]})

        self.assertEqual(Project.objects.count(), 1)
        existing.refresh_from_db()
        self.assertEqual(existing.title, 'Updated title')
        self.assertIn('imported=0, updated=1, skipped=0, failed=0', output)

    def test_invalid_json_is_reported_without_database_changes(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        path = Path(temporary.name) / 'broken.json'
        path.write_text('{bad json', encoding='utf-8')

        with self.assertRaises(CommandError):
            call_command('import_portfolio_projects', str(path))

        self.assertEqual(Project.objects.count(), 0)

    def test_missing_required_fields_are_counted_as_failed(self):
        record = self.project_data()
        del record['description']

        output = self.run_import({'projects': [record]})

        self.assertEqual(Project.objects.count(), 0)
        self.assertIn('imported=0, updated=0, skipped=0, failed=1', output)

    def test_dry_run_reports_create_without_writing(self):
        output = self.run_import(
            {'projects': [self.project_data()]}, '--dry-run'
        )

        self.assertEqual(Project.objects.count(), 0)
        self.assertIn('Dry run summary: imported=1', output)

    def test_import_preserves_unrelated_existing_records(self):
        preserved = Project.objects.create(
            title='Keep Existing',
            short_description='Existing summary',
            description='Existing description.',
            tech_stack=[],
        )

        self.run_import({'projects': [self.project_data()]})

        self.assertTrue(Project.objects.filter(pk=preserved.pk).exists())
        self.assertEqual(Project.objects.count(), 2)

    def test_identical_record_is_reported_as_skipped(self):
        record = self.project_data()
        Project.objects.create(**record)

        output = self.run_import({'projects': [record]})

        self.assertEqual(Project.objects.count(), 1)
        self.assertIn('imported=0, updated=0, skipped=1, failed=0', output)

    def test_sample_json_passes_dry_run_validation(self):
        sample = Path(__file__).parent / 'data' / 'sample_projects.json'
        output = StringIO()

        call_command('import_portfolio_projects', str(sample), '--dry-run', stdout=output)

        self.assertEqual(Project.objects.count(), 0)
        self.assertIn('imported=7, updated=0, skipped=0, failed=0', output.getvalue())

    def test_sample_json_contains_confirmed_lineup_and_featured_choice(self):
        sample = Path(__file__).parent / 'data' / 'sample_projects.json'
        payload = json.loads(sample.read_text(encoding='utf-8'))

        self.assertEqual(
            [item['slug'] for item in payload['projects']],
            [
                'flock-energy-meter-transformer-platform',
                'ai-powered-task-management-rest-api',
                'price-comparison-web-app',
                'shoply-clone',
                'note-taking-app',
                'point-and-shoot-canvas-game',
                'movie-x',
            ],
        )
        self.assertEqual(
            [item['slug'] for item in payload['projects'] if item['featured']],
            ['flock-energy-meter-transformer-platform'],
        )
        self.assertEqual(len(payload['projects']), 7)
        self.assertEqual(
            len({item['slug'] for item in payload['projects']}),
            7,
        )
        task_api = next(
            item for item in payload['projects']
            if item['slug'] == 'ai-powered-task-management-rest-api'
        )
        self.assertFalse(task_api['featured'])
        self.assertEqual(
            next(
                item['title'] for item in payload['projects']
                if item['slug'] == 'price-comparison-web-app'
            ),
            'Price Comparison Web App',
        )
        self.assertNotIn(
            'meter-transformer-management-platform',
            [item['slug'] for item in payload['projects']],
        )
        self.assertNotIn(
            'e-commerce-web-application',
            [item['slug'] for item in payload['projects']],
        )
        flock = next(
            item for item in payload['projects']
            if item['slug'] == 'flock-energy-meter-transformer-platform'
        )
        self.assertEqual(
            flock['live_url'],
            'https://flock-energy-frontend.onrender.com/login',
        )
        self.assertIn('fixture-backed', flock['description'])
        self.assertIn('not claim', flock['description'])

        pricehunter = next(
            item for item in payload['projects']
            if item['slug'] == 'price-comparison-web-app'
        )
        self.assertEqual(
            pricehunter['github_url'],
            'https://github.com/a7b0hishek/PriceHunter',
        )
        self.assertEqual(
            sum(item['slug'] == 'price-comparison-web-app' for item in payload['projects']),
            1,
        )
        self.assertTrue(all(
            not item['image_url'] for item in payload['projects']
        ))
        movie_x = next(
            item for item in payload['projects'] if item['slug'] == 'movie-x'
        )
        self.assertEqual(movie_x['title'], 'Movie-X')
        self.assertFalse(movie_x['featured'])
        self.assertIn('Top Rated', movie_x['short_description'])
        self.assertIn('cast, crew, ratings', movie_x['description'])
        self.assertIn('lazy-loaded', movie_x['description'])
        self.assertEqual(
            movie_x['live_url'], 'https://movie-x-orcin.vercel.app/'
        )
        self.assertEqual(
            movie_x['github_url'], 'https://github.com/a7b0hishek/Movie-X'
        )
        self.assertEqual(
            movie_x['tech_stack'],
            [
                'React.js', 'Redux Toolkit', 'React Router', 'TMDB API',
                'SCSS', 'JavaScript', 'Vercel',
            ],
        )
        self.assertEqual(movie_x['image_url'], '')

