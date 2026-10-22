from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.pagination import PageNumberPagination

from .models import Project
from .serializers import ProjectSerializer


class ProjectPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PublicJSONAPIView:
    permission_classes = (AllowAny,)
    renderer_classes = (JSONRenderer,)


class ProjectListView(PublicJSONAPIView, ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    pagination_class = ProjectPagination


class FeaturedProjectListView(PublicJSONAPIView, ListAPIView):
    queryset = Project.objects.filter(featured=True)
    serializer_class = ProjectSerializer
    pagination_class = ProjectPagination


class ProjectDetailView(PublicJSONAPIView, RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'
