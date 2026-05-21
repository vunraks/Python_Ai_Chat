from django.urls import path

from .views import create_chat, get_chat, health, list_chats, register, send_message

urlpatterns = [
    path("health/", health),
    path("chat/register/", register),
    path("chats/", list_chats),
    path("chat/create/", create_chat),
    path("chat/message/", send_message),
    path("chat/<int:chat_id>/", get_chat),
]
