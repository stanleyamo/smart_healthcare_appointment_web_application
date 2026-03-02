from django.test import TestCase
from .models import Patient, User, Consultation
from .serializers import ConsultationSerializer


class ConsultationSerializerTest(TestCase):
    def setUp(self):
        self.patient = Patient.objects.create(
            ghana_card_id="123",
            first_name="Jane",
            last_name="Doe",
            date_of_birth="1990-01-01",
            gender="F",
            phone="555-1234",
        )
        self.doctor = User.objects.create_user(
            username="drsmith",
            password="test",
            role="DOCTOR",
            first_name="John",
            last_name="Smith",
        )
        self.consultation = Consultation.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            chief_complaint="Headache",
        )

    def test_patient_name_in_serializer(self):
        serializer = ConsultationSerializer(self.consultation)
        data = serializer.data
        self.assertEqual(data.get("patient_name"), "Jane Doe")
        # doctor_name should include prefix
        self.assertEqual(data.get("doctor_name"), "Dr. John Smith")
