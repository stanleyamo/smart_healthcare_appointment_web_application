from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid

# 1. CUSTOM USER MODEL (Staff/Doctors/Admins)
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'System Administrator'),
        ('DOCTOR', 'Medical Doctor'),
        ('NURSE', 'Nursing Staff'),
        ('PHARMACIST', 'Pharmacist'),
        ('RECEPTIONIST', 'Front Desk/OPD'),
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
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='record')
    diagnosis = models.TextField()
    symptoms = models.TextField()
    notes = models.TextField(blank=True, null=True)
    blood_pressure = models.CharField(max_length=20, help_text="e.g. 120/80 mmHg")
    temperature = models.DecimalField(max_digits=4, decimal_places=1, help_text="In Celsius")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record for {self.patient.last_name} - {self.created_at.date()}"

class Prescription(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='prescriptions')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100) # e.g. 500mg
    frequency = models.CharField(max_length=100) # e.g. 2x daily
    duration = models.CharField(max_length=100) # e.g. 7 days
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