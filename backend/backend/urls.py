from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from hospital.views import PatientViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]