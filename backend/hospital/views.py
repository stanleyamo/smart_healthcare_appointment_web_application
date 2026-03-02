from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import PatientSummarySerializer
from .models import Patient, Appointment, MedicalRecord, Prescription, Consultation, User
from .serializers import (
    PatientSerializer, AppointmentSerializer,
    MedicalRecordSerializer, PrescriptionSerializer, ConsultationSerializer,
    UserSerializer
)


@api_view(['GET'])
def get_latest_medical_record(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    mr = MedicalRecord.objects.filter(patient=patient).order_by('-created_at').first()
    if not mr:
        return Response(status=404)
    serializer = MedicalRecordSerializer(mr)
    return Response(serializer.data)

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PatientViewSet(viewsets.ModelViewSet):
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