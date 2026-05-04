from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/users/', include('apps.users.urls')),
    path('api/prestataires/', include('apps.prestataires.urls')),
    path('api/demandes/', include('apps.demandes.urls')),
    path('api/avis/', include('apps.avis.urls')),
    path('api/devis/', include('apps.devis.urls')),
    path('api/chat/', include('apps.chat.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
