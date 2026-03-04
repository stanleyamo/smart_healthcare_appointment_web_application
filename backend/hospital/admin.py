# hospital/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Patient, Appointment, MedicalRecord, Prescription, LabOrder, Consultation

@admin.register(User)
class MyUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'staff_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'staff_id')}),
    )

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'ghana_card_id', 'gender')
    search_fields = ('first_name', 'last_name', 'ghana_card_id')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    # Fixed: changed 'appointment_date' to 'date_time'
    list_display = ('patient', 'doctor', 'date_time', 'status')
    list_filter = ('status', 'date_time')

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'created_at', 'blood_pressure')
    search_fields = ('patient__last_name', 'diagnosis')

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    # Fixed: removed 'status' (not in model) and verified issued_at
    list_display = ('medication_name', 'dosage', 'frequency', 'issued_at')
    search_fields = ('medication_name',)

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'status', 'date_created')
    list_filter = ('status',)

@admin.register(LabOrder)
class LabOrderAdmin(admin.ModelAdmin):
    list_display = ('test_name', 'patient', 'category', 'status', 'created_at')
    list_filter = ('category', 'status')
    search_fields = ('patient__first_name', 'patient__last_name', 'test_name')