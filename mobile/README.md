# Neural Chat — мобильное приложение (Expo Go)

React Native приложение для iOS/Android, подключено к Django API.

## Требования

- Node.js 20+
- Expo SDK **54** (совместимо с актуальным Expo Go)
- [Expo Go](https://expo.dev/go) на телефоне
- Запущенный backend: `python manage.py runserver 0.0.0.0:8000`

## Установка

```powershell
cd mobile
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npx expo install --fix
```

> Требуется **Expo Go SDK 54** (актуальная версия из App Store).

## Настройка API (важно для телефона!)

На **реальном телефоне** `127.0.0.1` не работает — нужен IP твоего ПК в Wi‑Fi.

1. Узнай IP: `ipconfig` → **IPv4** (например `192.168.1.105`)
2. Создай файл `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.105:8000/api
```

3. ПК и телефон должны быть в **одной Wi‑Fi сети**

| Среда | URL по умолчанию |
|--------|------------------|
| Android эмулятор | `http://10.0.2.2:8000/api` |
| iOS симулятор | `http://127.0.0.1:8000/api` |
| Expo Go на телефоне | IP ПК в `.env` |

## Запуск

```powershell
cd mobile
npx expo start
```

Отсканируй QR-код в приложении **Expo Go**.

## Backend

Запускай сервер так, чтобы он был доступен из сети:

```powershell
python manage.py runserver 0.0.0.0:8000
```

В `backend/settings.py` уже включены `CORS` и `ALLOWED_HOSTS=*` для разработки.

## Функции

- Регистрация / вход (JWT)
- Уведомление «Аккаунт создан»
- Список чатов (боковое меню ☰)
- История сообщений из БД
- Анимация «AI думает»
- Печать ответа по буквам
- Выбор модели AI
