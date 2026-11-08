from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views
r = DefaultRouter()
r.register("jobs", views.JobViewSet, basename="job")
r.register("applications", views.ApplicationViewSet, basename="application")
r.register("admin/users", views.AdminUserViewSet, basename="admin-user")
urlpatterns = [
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/me/", views.MeView.as_view()),
    path("admin/stats/", views.AdminStatsView.as_view()),
    path("", include(r.urls)),
]
