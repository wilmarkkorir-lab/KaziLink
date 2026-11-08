from django.db.models import Count
from rest_framework import viewsets, filters
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Application, Job, User
from .serializers import (ApplicationSerializer, JobSerializer, RegisterSerializer,
                          StatusSerializer, UserSerializer)

def RoleIs(*roles):
    class P(BasePermission):
        def has_permission(self, request, view):
            return request.user.is_authenticated and request.user.role in roles
    return P()

# ---- Auth ----
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True)
        user = s.save(); token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data}, status=201)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        from django.contrib.auth import authenticate
        user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
        if not user:
            raise ValidationError({"detail": "Invalid username or password."})
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request): return Response(UserSerializer(request.user).data)

# ---- Jobs ----
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "company", "description", "location"]
    filterset_fields = {"job_type": ["exact"], "category": ["iexact"],
                        "location": ["icontains"], "salary_min": ["gte"]}
    ordering_fields = ["created_at", "salary_min"]

    def get_queryset(self):
        qs = Job.objects.select_related("employer"); u = self.request.user
        if self.action in ("update", "partial_update", "destroy"):
            return qs if u.role == "admin" else qs.filter(employer=u)
        if self.action in ("mine", "applicants"):
            return qs.filter(employer=u)
        return qs.filter(is_active=True)

    def get_permissions(self):
        if self.action in ("list", "retrieve"): return [AllowAny()]
        if self.action in ("create", "mine", "applicants"): return [RoleIs("employer")]
        return [RoleIs("employer", "admin")]

    def perform_create(self, s): s.save(employer=self.request.user)

    @action(detail=False)
    def mine(self, request):
        return Response(self.get_serializer(self.get_queryset(), many=True).data)

    @action(detail=True)
    def applicants(self, request, pk=None):
        apps = self.get_object().applications.select_related("applicant", "job")
        return Response(ApplicationSerializer(apps, many=True, context={"request": request}).data)

# ---- Applications ----
class ApplicationViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "post", "patch"]
    def get_serializer_class(self):
        return StatusSerializer if self.action == "partial_update" else ApplicationSerializer
    def get_queryset(self):
        u = self.request.user; qs = Application.objects.select_related("job", "applicant")
        if u.role == "admin": return qs
        if u.role == "employer": return qs.filter(job__employer=u)
        return qs.filter(applicant=u)
    def get_permissions(self):
        if self.action == "create": return [RoleIs("seeker")]
        if self.action == "partial_update": return [RoleIs("employer", "admin")]
        return [IsAuthenticated()]
    def perform_create(self, s):
        job, user = s.validated_data["job"], self.request.user
        if not job.is_active: raise ValidationError({"detail": "This job is closed."})
        if Application.objects.filter(job=job, applicant=user).exists():
            raise ValidationError({"detail": "You already applied to this job."})
        s.save(applicant=user, status="pending")

# ---- Admin ----
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    http_method_names = ["get", "patch", "delete"]
    permission_classes = [RoleIs("admin")]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "email"]

class AdminStatsView(APIView):
    permission_classes = [RoleIs("admin")]
    def get(self, request):
        by = lambda qs, f: {r[f]: r["n"] for r in qs.values(f).annotate(n=Count("id"))}
        return Response({
            "users": by(User.objects, "role"),
            "jobs": Job.objects.count(), "active_jobs": Job.objects.filter(is_active=True).count(),
            "applications": by(Application.objects, "status"),
            "total_applications": Application.objects.count(),
        })
