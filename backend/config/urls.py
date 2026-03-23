from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/users/', include('apps.users.urls')),
    path('api/prestataires/', include('apps.prestataires.urls')),
    path('api/demandes/', include('apps.demandes.urls')),
    path('api/avis/', include('apps.avis.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/devis/', include('apps.devis.urls')),
]
