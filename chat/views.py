from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .ai import ask_ai
from .models import Chat, Message


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh.refresh_token),
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"ok": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""

    if not username or not password:
        return Response(
            {"error": "Укажите логин и пароль"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 6:
        return Response(
            {"error": "Пароль должен быть не короче 6 символов"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Пользователь уже существует"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, password=password)
    return Response(_tokens_for_user(user), status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_chats(request):
    chats = Chat.objects.filter(user=request.user)
    return Response(
        [
            {
                "id": chat.id,
                "title": chat.title,
                "created_at": chat.created_at,
            }
            for chat in chats
        ]
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_chat(request):
    title = (request.data.get("title") or "New Chat").strip() or "New Chat"
    chat = Chat.objects.create(user=request.user, title=title)
    return Response({"id": chat.id, "title": chat.title})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    message = (request.data.get("message") or "").strip()
    model = request.data.get("model")
    chat_id = request.data.get("chat_id")

    if not message:
        return Response(
            {"error": "Сообщение не может быть пустым"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if chat_id:
        try:
            chat = Chat.objects.get(id=chat_id, user=request.user)
        except Chat.DoesNotExist:
            return Response(
                {"error": "Чат не найден"},
                status=status.HTTP_404_NOT_FOUND,
            )
    else:
        chat = Chat.objects.create(
            user=request.user,
            title=message[:50],
        )

    Message.objects.create(chat=chat, role="user", content=message)

    history = [
        {"role": msg.role, "content": msg.content}
        for msg in chat.messages.all()
    ]
    answer = ask_ai(history, model)

    Message.objects.create(chat=chat, role="assistant", content=answer)

    return Response({"response": answer, "chat_id": chat.id, "title": chat.title})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, user=request.user)
    except Chat.DoesNotExist:
        return Response(
            {"error": "Чат не найден"},
            status=status.HTTP_404_NOT_FOUND,
        )

    messages = list(
        chat.messages.all().values("role", "content", "created_at")
    )

    return Response(
        {
            "id": chat.id,
            "title": chat.title,
            "messages": messages,
        }
    )
