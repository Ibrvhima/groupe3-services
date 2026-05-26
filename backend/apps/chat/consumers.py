import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer pour le chat en temps réel.
    Authentification via JWT passé en query string : ?token=<access_token>
    """

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # 1. Authentification JWT
        self.user = await self.authenticate()
        if self.user is None:
            await self.close(code=4001)   # Non authentifié
            return

        # 2. Vérifier l'accès à la conversation
        if not await self.check_access():
            await self.close(code=4003)   # Interdit
            return

        # 3. Rejoindre le groupe de la conversation
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Reçoit un message du client WebSocket et le diffuse à tous les participants."""
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        contenu = data.get('contenu', '').strip()
        if not contenu:
            return

        # Sauvegarde en base + sérialisation
        message_data = await self.save_and_serialize(contenu)

        # Diffuse à tous les membres du groupe (les deux participants)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'message': message_data},
        )

    async def chat_message(self, event):
        """Reçu du channel layer → envoyé au WebSocket du client."""
        await self.send(text_data=json.dumps({
            'type':    'message',
            'message': event['message'],
        }))

    # ── Méthodes DB (sync → async) ─────────────────────────────────────────────

    @database_sync_to_async
    def authenticate(self):
        from apps.users.models import User
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

        query_string = self.scope.get('query_string', b'').decode()
        params = {}
        for part in query_string.split('&'):
            if '=' in part:
                k, v = part.split('=', 1)
                params[k] = v

        token_str = params.get('token', '')
        if not token_str:
            return None

        try:
            token = AccessToken(token_str)
            return User.objects.get(id=token['user_id'])
        except (InvalidToken, TokenError, User.DoesNotExist, Exception):
            return None

    @database_sync_to_async
    def check_access(self):
        from .models import Conversation
        try:
            conv = Conversation.objects.get(id=self.conversation_id)
            return self.user == conv.client or self.user == conv.prestataire
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_and_serialize(self, contenu):
        from .models import Conversation, Message
        from apps.notifications.models import Notification

        conv = Conversation.objects.select_related('client', 'prestataire').get(
            id=self.conversation_id
        )
        msg = Message.objects.create(
            conversation=conv,
            expediteur=self.user,
            contenu=contenu,
        )

        # Notification au destinataire
        destinataire = conv.prestataire if self.user == conv.client else conv.client
        Notification.objects.create(
            user=destinataire,
            titre=f"Nouveau message de {self.user.prenom} {self.user.nom}",
            message=contenu[:100],
        )

        return {
            'id':         msg.id,
            'contenu':    msg.contenu,
            'date_envoi': msg.date_envoi.isoformat(),
            'lu':         msg.lu,
            'expediteur': {
                'id':     self.user.id,
                'nom':    self.user.nom,
                'prenom': self.user.prenom,
                'photo':  self.user.photo.url if self.user.photo else None,
            },
        }
