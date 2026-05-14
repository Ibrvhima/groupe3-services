from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/', include('apps.prestataires.urls')),
    path('api/', include('apps.demandes.urls')),
    path('api/', include('apps.avis.urls')),
]