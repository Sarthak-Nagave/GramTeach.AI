# backend/app/services/elevenlabs_service.py

import os
import requests
from ..config import settings

# --------------------------------------------------
# CONFIG
# --------------------------------------------------
ELEVEN_API_KEY = settings.ELEVENLABS_API_KEY
MODEL_ID = "eleven_multilingual_v2"

VOICE_MAP = {
    "english": "ZT9u07TYPVl83ejeLakq",
    "hindi": "amiAXapsDOAiHJqbsAZj",
    "marathi": "RBxPIvrKOP4ugCK2jVHD",
}


# --------------------------------------------------
# VOICE SELECTOR
# --------------------------------------------------
def select_voice(language: str) -> str:
    if not language:
        return VOICE_MAP["english"]

    lang = language.lower()
    return VOICE_MAP.get(lang, VOICE_MAP["english"])


# --------------------------------------------------
# GENERATE AUDIO (TTS)
# --------------------------------------------------
def generate_voice(
    text: str,
    filename: str,
    language: str = "english"
) -> str:
    """
    Generates high-quality speech using ElevenLabs.
    Safe for long narration (6–7 min).
    """

    if not ELEVEN_API_KEY:
        raise Exception("ElevenLabs API key missing")

    voice_id = select_voice(language)

    output_dir = "tmp_audio"
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, filename)

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    payload = {
        "model_id": MODEL_ID,
        "text": text.strip(),
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.75,
            "style": 0.6,
            "use_speaker_boost": True,
        },
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=120
    )

    if response.status_code != 200:
        raise Exception(
            f"ElevenLabs TTS failed [{response.status_code}]: {response.text}"
        )

    with open(output_path, "wb") as f:
        f.write(response.content)

    print(f"[ElevenLabs] Audio generated → {output_path}")
    return output_path
