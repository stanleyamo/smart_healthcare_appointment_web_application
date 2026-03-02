from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from hospital.views import PatientViewSet, AppointmentViewSet, MedicalRecordViewSet, ConsultationViewSet, DoctorViewSet, get_patient_summary

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'records', MedicalRecordViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'doctors', DoctorViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/patients/<uuid:pk>/summary/', get_patient_summary, name='patient-summary'),
]