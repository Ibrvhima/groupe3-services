from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class   = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')[:50]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def marquer_toutes_lues(request):
    Notification.objects.filter(user=request.user, lu=False).update(lu=True)
    return Response({'detail': 'Toutes les notifications marquées comme lues.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def marquer_lue(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
        notif.lu = True
        notif.save()
        return Response(NotificationSerializer(notif).data)
    except Notification.DoesNotExist:
        return Response({'detail': 'Introuvable.'}, status=404)
