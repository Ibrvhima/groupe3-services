from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/',  include('apps.users.urls')),
    path('api/admin/',  include('apps.users.admin_urls')),
    path('api/',        include('apps.prestataires.urls')),
    path('api/',        include('apps.demandes.urls')),
    path('api/',        include('apps.avis.urls')),
    path('api/',        include('apps.notifications.urls')),
    path('api/',        include('apps.devis.urls')),
    path('api/',        include('apps.chat.urls')),
]

# Sert les fichiers media (photos de profil) — nécessaire en production sur Render
# (Render utilise gunicorn sans nginx, Django doit servir /media/ lui-même)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
