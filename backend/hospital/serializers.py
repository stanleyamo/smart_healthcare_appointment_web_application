from rest_framework import serializers
from .models import Patient, Appointment, MedicalRecord, Prescription, User, Consultation

class PatientSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = Patient
        fields = '__all__'

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

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
    # `patient.name` doesn't exist on the model (name is a SerializerMethodField
    # on PatientSerializer), so the previous implementation returned empty
    # values.  Use SerializerMethodField like in AppointmentSerializer to
    # compute the full name.  This ensures `patient_name` is populated for
    # both newly created and existing consultations.
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = '__all__'

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}" if obj.patient else ""

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"
        return ""


class DoctorSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name')

    def get_name(self, obj):
        return f"Dr. {obj.first_name} {obj.last_name}"