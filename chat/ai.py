import os

import requests

API_KEY = os.getenv("OPENROUTER_API_KEY")
URL = "https://openrouter.ai/api/v1/chat/completions"


def ask_ai(messages, model):
    if not model:
        model = "meta-llama/llama-3-8b-instruct:free"

    payload_messages = [{"role": "system", "content": "Ты полезный ассистент"}]
    payload_messages.extend(messages)

    response = requests.post(
        URL,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": payload_messages,
        },
        timeout=120,
    )

    data = response.json()

    if "choices" not in data:
        return f"ERROR: {data}"

    return data["choices"][0]["message"]["content"]
