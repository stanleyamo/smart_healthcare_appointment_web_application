from rest_framework import serializers
from .models import Patient, Appointment, MedicalRecord, Prescription, User, Consultation

class PatientSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = Patient
        fields = '__all__'

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class PatientSummarySerializer(serializers.ModelSerializer):
    # The original version attempted to pull data from a `medicalrecord` reverse
    # relation that doesn't exist (it's `medical_records` and there may be
    # multiple entries).  As a result the API always returned empty strings and
    # the client showed "None documented" even when the patient had values set
    # during registration.  Use SerializerMethodFields so we can pick the most
    # recent medical record and fall back to the patient row.
    allergies = serializers.SerializerMethodField()
    chronic_conditions = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ['id', 'allergies', 'chronic_conditions']

    def _latest_medical(self, obj):
        # grab the newest record if it exists
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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'first_name', 'last_name']

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

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

    # input-only fields from the form, stored later in MedicalRecord
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
        # Return the most recent medical record for this patient.  There is no
        # direct FK from Consultation to MedicalRecord, so we look up by
        # patient and sort by creation time.  This mirrors the logic used in the
        # PatientSummarySerializer and prevents losing data when displaying
        # consultations.
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
        medical_record = getattr(instance, 'medical_record', None)

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
            appointment=instance.appointment,
            defaults=medical_record_data
        )

        return instance