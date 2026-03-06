from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver
from .utils import log_action
import uuid

# 1. CUSTOM USER MODEL (Staff/Doctors/Admins)
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'System Administrator'),
        ('DOCTOR', 'Medical Doctor'),
        ('NURSE', 'Nursing Staff'),
        ('PHARMACIST', 'Pharmacist'),
        ('RECEPTIONIST', 'Front Desk/OPD'),
        ('LAB_TECH', 'Laboratory Technician'),
        ('RADIOLOGIST', 'Radiologist'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RECEPTIONIST')
    staff_id = models.CharField(max_length=20, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

# 2. PATIENT MODEL
class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ghana_card_id = models.CharField(max_length=20, unique=True)
    nhis_number = models.CharField(max_length=20, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=(('M', 'Male'), ('F', 'Female')))
    phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    chronic_conditions = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# 3. APPOINTMENT MODEL
class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('IN-PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'DOCTOR'})
    date_time = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    def __str__(self):
        return f"{self.patient} - {self.status}"


#Patiend & Doctor History
class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.SET_NULL,
        related_name='record',
        null=True,
        blank=True
    )
    diagnosis = models.TextField()
    symptoms = models.TextField()
    notes = models.TextField(blank=True, null=True)
    blood_pressure = models.CharField(max_length=20, help_text="e.g. 120/80 mmHg")
    temperature = models.DecimalField(max_digits=4, decimal_places=1, help_text="In Celsius")
    allergies = models.TextField(blank=True, null=True)
    chronic_conditions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record for {self.patient.last_name} - {self.created_at.date()}"

class Prescription(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='prescriptions')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.TextField(blank=True)

    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medication_name} for {self.medical_record.patient.last_name}"

class Consultation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN-PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]


    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'DOCTOR'})
    chief_complaint = models.TextField()
    diagnosis = models.TextField(blank=True, null=True)
    subjective = models.TextField(blank=True, null=True)
    objective = models.TextField(blank=True, null=True)
    assessment = models.TextField(blank=True, null=True)
    plan = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation for {self.patient} - {self.date_created.date()}"

class LabOrder(models.Model):
    CATEGORY_CHOICES = [('LAB', 'Laboratory'), ('RAD', 'Radiology')]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SAMPLE_TAKEN', 'Sample Taken'),
        ('COMPLETED', 'Completed')
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_orders')

    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='lab_orders')

    test_name = models.CharField(max_length=255) # Doctor types: "Malaria, FBC"
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='LAB')

    ordered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ordered_labs'
    )


    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='performed_labs'
    )

    instructions = models.TextField(blank=True)
    results = models.TextField(blank=True)
    result_file = models.FileField(upload_to='lab_results/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')


    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.test_name} - {self.patient.last_name} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20)
    resource = models.CharField(max_length=50)
    target = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    log_action(user, "AUTH", "Login", "User logged in successfully", request)

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    log_action(None, "AUTH", "Login Failed", f"Failed attempt for: {credentials.get('username')}", request)

class HospitalSettings(models.Model):
    facility_name = models.CharField(max_length=255, default="Korle Bu Teaching Hospital")
    facility_code = models.CharField(max_length=50, default="KBTH-001")
    contact_phone = models.CharField(max_length=20, default="+233 302 665 401")
    email = models.EmailField(default="info@kbth.gov.gh")
    region = models.CharField(max_length=100, default="greater-accra")
    session_timeout = models.IntegerField(default=30)
    audit_logging = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super(HospitalSettings, self).save(*args, **kwargs)