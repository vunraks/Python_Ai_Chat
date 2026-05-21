import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    # PostgreSQL: DELETE и ALTER TABLE нельзя в одной транзакции
    atomic = False

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0004_rename_user_message_chat_remove_chat_user_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="TRUNCATE TABLE chat_chat RESTART IDENTITY CASCADE;",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AddField(
            model_name='chat',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='chats',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterModelOptions(
            name='chat',
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterModelOptions(
            name='message',
            options={'ordering': ['created_at']},
        ),
    ]
