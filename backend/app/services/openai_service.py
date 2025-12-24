# backend/app/services/openai_service.py

import json
import re
import openai
from ..config import settings

# -----------------------------------------------------------
# OpenAI Config (SDK v0.28)
# -----------------------------------------------------------
openai.api_key = settings.OPENAI_API_KEY


# ===========================================================
# 🌐 LANGUAGE DETECTION (SAFE)
# ===========================================================
def detect_language(text: str) -> str:
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Detect the language of the text. "
                        "Reply with ONLY one word: English, Hindi, or Marathi."
                    )
                },
                {"role": "user", "content": text}
            ],
            temperature=0
        )

        lang = resp.choices[0].message["content"].strip()
        return lang if lang in ["English", "Hindi", "Marathi"] else "English"

    except Exception:
        return "English"


# ===========================================================
# 🎬 SCRIPT GENERATOR (UNCHANGED)
# ===========================================================
def generate_script(topic: str, language: str = None, num_scenes: int = 10) -> str:
    lang = language or detect_language(topic)

    prompt = f"""
You are a PROFESSIONAL educational content writer.

⚠️ CRITICAL INSTRUCTIONS (MUST FOLLOW):
- Output ONLY the scenes (NO intro, NO explanation).
- Use EXACT format shown below.
- EXACTLY {num_scenes} scenes.
- Total narration length MUST be ~900–1100 words.
- Narration ONLY in {lang}.
- Visual descriptions MUST be cinematic and detailed.
- NEVER translate "Visual Description" or "Narrator".

FORMAT (CASE-SENSITIVE):

[SCENE 1]
(Visual Description: <cinematic image prompt>)
Narrator: <long educational narration in {lang}>

Repeat until [SCENE {num_scenes}]

Topic: "{topic}"
Language: {lang}
"""

    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You generate STRICT educational scripts."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6
        )
        return resp.choices[0].message["content"].strip()

    except Exception as e:
        print("[openai_service] generate_script ERROR:", e)
        return ""


# ===========================================================
# 📝 QUIZ GENERATOR (FIXED & HARDENED)
# ===========================================================
def generate_quiz(topic: str, num_questions: int = 5) -> list:
    """
    Generates quiz questions with GUARANTEED JSON output.
    """

    prompt = f"""
Generate exactly {num_questions} multiple-choice questions about "{topic}".

Return ONLY valid JSON in this format:

[
  {{
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "A"
  }}
]

Rules:
- NO markdown
- NO explanation
- NO extra text
"""

    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a JSON API. "
                        "You output ONLY valid JSON. "
                        "Never add explanations or markdown."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        raw = resp.choices[0].message["content"].strip()
        print("[QUIZ RAW OUTPUT]", raw)

        # ---------------------------
        # HARD JSON EXTRACTION
        # ---------------------------
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if not match:
            raise ValueError("No JSON array found in response")

        json_text = match.group(0)

        quiz = json.loads(json_text)

        # ---------------------------
        # VALIDATE STRUCTURE
        # ---------------------------
        validated = []
        for q in quiz:
            if (
                isinstance(q, dict)
                and "question" in q
                and "options" in q
                and "answer" in q
                and isinstance(q["options"], list)
                and len(q["options"]) == 4
            ):
                validated.append(q)

        if not validated:
            raise ValueError("Quiz JSON invalid structure")

        return validated

    except Exception as e:
        print("[openai_service] generate_quiz ERROR:", e)
        return []
