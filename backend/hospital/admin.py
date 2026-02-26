from django.contrib import admin
from .models import User, Patient, Appointment, MedicalRecord, Prescription

admin.site.register(User)
admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(MedicalRecord)
admin.site.register(Prescription)