from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from hospital.views import (
    PatientViewSet, AppointmentViewSet, MedicalRecordViewSet,
    ConsultationViewSet, DoctorViewSet, get_patient_summary,
    get_latest_medical_record, PrescriptionViewSet,
    LabOrderViewSet, MyTokenObtainPairView, AuditLogViewSet
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'records', MedicalRecordViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'doctors', DoctorViewSet, basename='doctors-list')
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'lab-orders', LabOrderViewSet)
router.register(r'audit-logs', AuditLogViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/patients/<uuid:pk>/summary/', get_patient_summary, name='patient-summary'),
    path('api/patients/<uuid:pk>/records/latest/', get_latest_medical_record, name='patient-latest-record'),
]