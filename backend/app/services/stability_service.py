# backend/app/services/stability_service.py

import requests
import os
import base64
from pathlib import Path
from PIL import Image
from ..config import settings

# ---------------------------
# SAFE TRANSLATE → ENGLISH
# ---------------------------
def _translate_to_en(text: str) -> str:
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source="auto", target="en").translate(text)
    except Exception:
        return text


# Stability endpoint (SDXL 1024)
STABILITY_API_URL = (
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
)


# ---------------------------
# PLACEHOLDER GENERATOR
# ---------------------------
def create_placeholder_image(output_filename: str):
    folder = Path(getattr(settings, "TEMP_DIR", "./tmp")).resolve()
    folder.mkdir(parents=True, exist_ok=True)

    file_path = folder / output_filename
    img = Image.new("RGB", (1024, 1024), (40, 52, 71))

    img.save(file_path)
    print(f"[stability] Placeholder generated → {file_path}")
    return str(file_path)


# ---------------------------
# MAIN IMAGE GENERATOR
# ---------------------------
def generate_image(prompt: str, output_filename: str):
    """
    Always returns a real local file path.
    Never returns a URL.
    Never returns missing or invalid images.
    """
    if not prompt:
        return create_placeholder_image(output_filename)

    cinematic_prompt = (
        f"High quality cinematic scene, dramatic lighting, ultra sharp, highly detailed, "
        f"wide angle, depth of field -- {prompt}"
    )

    english_prompt = _translate_to_en(cinematic_prompt)

    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {getattr(settings, 'STABILITY_API_KEY', '')}",
    }

    json_body = {
        "steps": 28,
        "width": 1024,
        "height": 1024,
        "cfg_scale": 7.5,
        "samples": 1,
        "text_prompts": [{"text": english_prompt, "weight": 1}],
    }

    try:
        resp = requests.post(
            STABILITY_API_URL,
            headers=headers,
            json=json_body,
            timeout=60,
        )

        if resp.status_code != 200:
            print(f"[stability] API ERROR {resp.status_code}: {resp.text[:200]}")
            return create_placeholder_image(output_filename)

        data = resp.json()
        img_b64 = (
            data.get("artifacts", [{}])[0].get("base64")
            if data.get("artifacts")
            else None
        )

        if not img_b64:
            print("[stability] ERROR: No base64 image in response")
            return create_placeholder_image(output_filename)

        # ---------------------------
        # SAVE IMAGE TO LOCAL FILE
        # ---------------------------
        folder = Path(getattr(settings, "TEMP_DIR", "./tmp")).resolve()
        folder.mkdir(parents=True, exist_ok=True)

        file_path = folder / output_filename

        with open(file_path, "wb") as f:
            f.write(base64.b64decode(img_b64))

        # ---------------------------
        # Convert → RGB for MoviePy
        # ---------------------------
        try:
            img = Image.open(file_path)
            img = img.convert("RGB")
            img.save(file_path)
            img.close()
        except Exception as e:
            print("[stability] Failed RGB convert:", e)

        print(f"[stability] Final Image Saved → {file_path}")

        return str(file_path)

    except Exception as e:
        print("[stability] Exception:", e)
        return create_placeholder_image(output_filename)
