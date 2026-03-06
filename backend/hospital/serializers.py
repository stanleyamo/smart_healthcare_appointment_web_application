from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import (Patient, Appointment,
                     MedicalRecord, Prescription,
                     User, Consultation, LabOrder,
                     AuditLog, HospitalSettings)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['full_name'] = f"{self.user.first_name} {self.user.last_name}"
        return data

class PatientSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = Patient
        fields = '__all__'

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class PatientSummarySerializer(serializers.ModelSerializer):
    allergies = serializers.SerializerMethodField()
    chronic_conditions = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ['id', 'allergies', 'chronic_conditions']

    def _latest_medical(self, obj):
        return obj.medical_records.order_by('-created_at').first()

    def get_allergies(self, obj):
        mr = self._latest_medical(obj)
        if mr and mr.allergies:
            return mr.allergies
        return obj.allergies or ""

    def get_chronic_conditions(self, obj):
        mr = self._latest_medical(obj)
        if mr and mr.chronic_conditions:
            return mr.chronic_conditions
        return obj.chronic_conditions or ""

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', 'Hospital@2026')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = '__all__'

    def get_patient_name(self, obj):
        try:
            patient = obj.medical_record.patient
            return f"{patient.first_name} {patient.last_name}"
        except AttributeError:
            return "Unknown Patient"

class MedicalRecordSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    class Meta:
        model = MedicalRecord
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"

    def get_date(self, obj):
        return obj.date_time.date().isoformat()

    def get_time(self, obj):
        return obj.date_time.strftime("%H:%M")

class ConsultationSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    diagnosis = serializers.CharField(write_only=True, required=False, allow_blank=True)
    symptoms = serializers.CharField(write_only=True, required=False, allow_blank=True)
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)
    blood_pressure = serializers.CharField(write_only=True, required=False, allow_blank=True)
    temperature = serializers.DecimalField(write_only=True, required=False, max_digits=4, decimal_places=1)
    allergies = serializers.CharField(write_only=True, required=False, allow_blank=True)
    chronic_conditions = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Consultation
        fields = '__all__'

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}" if obj.patient else ""

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}" if obj.doctor else ""

    def _fetch_medical_record(self, instance):
        return MedicalRecord.objects.filter(patient=instance.patient).order_by('-created_at').first()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        mr = self._fetch_medical_record(instance)
        if mr:
            data['diagnosis'] = mr.diagnosis or data.get('diagnosis', '')
            data['symptoms'] = mr.symptoms or data.get('symptoms', '')
            data['notes'] = mr.notes or data.get('notes', '')
            data['blood_pressure'] = mr.blood_pressure or data.get('blood_pressure', '')
            data['temperature'] = str(mr.temperature) if mr.temperature is not None else data.get('temperature', None)
            data['allergies'] = mr.allergies or data.get('allergies', '')
            data['chronic_conditions'] = mr.chronic_conditions or data.get('chronic_conditions', '')
        return data

    def create(self, validated_data):
        medical_record_data = {
            'diagnosis': validated_data.pop('diagnosis', ''),
            'symptoms': validated_data.pop('symptoms', ''),
            'notes': validated_data.pop('notes', ''),
            'blood_pressure': validated_data.pop('blood_pressure', ''),
            'temperature': validated_data.pop('temperature', None),
            'allergies': validated_data.pop('allergies', ''),
            'chronic_conditions': validated_data.pop('chronic_conditions', ''),
            'doctor': validated_data.get('doctor'),
        }


        consultation = Consultation.objects.create(**validated_data)

        MedicalRecord.objects.create(
            patient=consultation.patient,
            appointment=None,
            **medical_record_data
        )

        return consultation

    def update(self, instance, validated_data):
        medical_record = self._fetch_medical_record(instance)
        medical_record_data = {
            'diagnosis': validated_data.pop('diagnosis', medical_record.diagnosis if medical_record else ''),
            'symptoms': validated_data.pop('symptoms', medical_record.symptoms if medical_record else ''),
            'notes': validated_data.pop('notes', medical_record.notes if medical_record else ''),
            'blood_pressure': validated_data.pop('blood_pressure', medical_record.blood_pressure if medical_record else ''),
            'temperature': validated_data.pop('temperature', medical_record.temperature if medical_record else None),
            'allergies': validated_data.pop('allergies', medical_record.allergies if medical_record else ''),
            'chronic_conditions': validated_data.pop('chronic_conditions', medical_record.chronic_conditions if medical_record else ''),
        }

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        MedicalRecord.objects.update_or_create(
            patient=instance.patient,
            id=medical_record.id if medical_record else None,
            defaults=medical_record_data
        )

        return instance

class LabOrderSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = LabOrder
        fields = '__all__'

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return f"Dr. {obj.ordered_by.last_name}" if obj.ordered_by else "Unknown"

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = AuditLog
        fields = ['id', 'timestamp', 'user_name', 'action', 'resource', 'target', 'ip_address']

class HospitalSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalSettings
        fields = '__all__'
