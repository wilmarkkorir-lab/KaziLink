from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [("seeker", "Job seeker"), ("employer", "Employer"), ("admin", "Admin")]
    role = models.CharField(max_length=10, choices=ROLES, default="seeker")
    def save(self, *a, **kw):
        if self.is_superuser:
            self.role = "admin"
        super().save(*a, **kw)

class Job(models.Model):
    TYPES = [("full", "Full-time"), ("part", "Part-time"), ("contract", "Contract"),
             ("intern", "Internship"), ("remote", "Remote")]
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    location = models.CharField(max_length=120)
    category = models.CharField(max_length=80)
    job_type = models.CharField(max_length=10, choices=TYPES, default="full")
    description = models.TextField()
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]
    def __str__(self): return f"{self.title} @ {self.company}"

class Application(models.Model):
    STATUS = [("pending", "Pending"), ("reviewed", "Reviewed"), ("shortlisted", "Shortlisted"),
              ("rejected", "Rejected"), ("hired", "Hired")]
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    status = models.CharField(max_length=12, choices=STATUS, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ("job", "applicant")
        ordering = ["-created_at"]
