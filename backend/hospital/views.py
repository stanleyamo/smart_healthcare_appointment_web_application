from rest_framework import viewsets, filters, permissions, response, status
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import PatientSummarySerializer, MyTokenObtainPairSerializer
from .models import (
    Patient, Appointment, MedicalRecord,
    Prescription, Consultation, User, LabOrder,
    AuditLog, HospitalSettings)
from .serializers import (
    PatientSerializer, AppointmentSerializer,
    MedicalRecordSerializer, PrescriptionSerializer, ConsultationSerializer,
    UserSerializer, LabOrderSerializer, AuditLogSerializer, HospitalSettingsSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role='DOCTOR')
    serializer_class = UserSerializer

class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'ghana_card_id', 'phone']
    ordering_fields = ['created_at', 'last_name']

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        patient = self.get_object()
        return Response({
            "allergies": patient.allergies if hasattr(patient, 'allergies') else "None",
            "blood_group": patient.blood_group if hasattr(patient, 'blood_group') else "N/A",
            "chronic_conditions": patient.chronic_conditions if hasattr(patient, 'chronic_conditions') else "None",
            "last_visit": "2023-10-01" # Example static data or fetch from MedicalRecord
        })


    @action(detail=True, methods=['get'], url_path='records/latest')
    def latest_record(self, request, pk=None):
        patient = self.get_object()
        # Using 'created_at' from your Model
        mr = MedicalRecord.objects.filter(patient=patient).order_by('-created_at').first()
        if not mr:
            return Response({"detail": "No records found"}, status=404)
        serializer = MedicalRecordSerializer(mr)
        return Response(serializer.data)

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'doctor', 'date_time']
    ordering = ['-date_time']

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'patient']
    search_fields = ['medication', 'patient__first_name', 'patient__last_name']

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        consultation = serializer.save(doctor=self.request.user)
        record = MedicalRecord.objects.create(
            patient=consultation.patient,
            doctor=consultation.doctor,
            appointment=None,
            diagnosis=consultation.diagnosis or "Pending",
            symptoms=consultation.chief_complaint,
            blood_pressure=self.request.data.get('blood_pressure', 'N/A'),
            temperature=self.request.data.get('temperature', 0.0),
        )

        consultation.generated_record_id = record.id

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        instance = Consultation.objects.get(id=response.data['id'])
        if hasattr(instance, 'generated_record_id'):
            response.data['medical_record_id'] = instance.generated_record_id
        return response

class LabOrderViewSet(viewsets.ModelViewSet):
    queryset = LabOrder.objects.all()
    serializer_class = LabOrderSerializer

    def perform_create(self, serializer):
        serializer.save(ordered_by=self.request.user)

    def perform_update(self, serializer):
        new_status = self.request.data.get('status')
        if new_status == 'COMPLETED':
            serializer.save(
                performed_by=self.request.user,
                completed_at=timezone.now()
            )
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def pending_count(self, request):
        count = LabOrder.objects.filter(status='PENDING').count()
        return Response({'count': count})

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

class HospitalSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalSettingsSerializer

    def get_object(self):
        obj, created = HospitalSettings.objects.get_or_create(pk=1)
        return obj

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return response.Response(serializer.data)