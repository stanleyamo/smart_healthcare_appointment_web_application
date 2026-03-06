from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import PatientSummarySerializer, MyTokenObtainPairSerializer
from .models import (
    Patient, Appointment, MedicalRecord,
    Prescription, Consultation, User, LabOrder,
    AuditLog)
from .serializers import (
    PatientSerializer, AppointmentSerializer,
    MedicalRecordSerializer, PrescriptionSerializer, ConsultationSerializer,
    UserSerializer, LabOrderSerializer, AuditLogSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def get_latest_medical_record(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    mr = MedicalRecord.objects.filter(patient=patient).order_by('-created_at').first()
    if not mr:
        return Response(status=404)
    serializer = MedicalRecordSerializer(mr)
    return Response(serializer.data)

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

@api_view(['GET'])
def get_patient_summary(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    serializer = PatientSummarySerializer(patient)
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

class LabOrderViewSet(viewsets.ModelViewSet):
    queryset = LabOrder.objects.all().order_by('-created_at')
    serializer_class = LabOrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination
