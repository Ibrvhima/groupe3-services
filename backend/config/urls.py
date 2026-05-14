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
]

# Sert les fichiers media (photos de profil) en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
