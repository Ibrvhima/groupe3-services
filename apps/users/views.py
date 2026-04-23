from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user   = serializer.save()
        tokens = RefreshToken.for_user(user)
        return Response({
            'user':    UserSerializer(user).data,
            'access':  str(tokens.access_token),
            'refresh': str(tokens),
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user