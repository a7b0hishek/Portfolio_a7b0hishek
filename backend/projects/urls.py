from django.urls import path

from .views import FeaturedProjectListView, ProjectDetailView, ProjectListView

urlpatterns = [
    path('', ProjectListView.as_view(), name='project-list'),
    path('featured/', FeaturedProjectListView.as_view(), name='project-featured'),
    path('<str:slug>/', ProjectDetailView.as_view(), name='project-detail'),
]
