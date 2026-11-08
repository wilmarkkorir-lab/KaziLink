from rest_framework import serializers
from .models import Application, Job, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_active"]
        read_only_fields = ["id", "username", "email", "role"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=["seeker", "employer"])
    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]
    def create(self, data):
        return User.objects.create_user(**data)

class JobSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source="employer.username", read_only=True)
    applications_count = serializers.IntegerField(source="applications.count", read_only=True)
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["employer"]

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company = serializers.CharField(source="job.company", read_only=True)
    applicant_name = serializers.CharField(source="applicant.username", read_only=True)
    applicant_email = serializers.CharField(source="applicant.email", read_only=True)
    class Meta:
        model = Application
        fields = "__all__"
        read_only_fields = ["applicant", "status"]

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]
