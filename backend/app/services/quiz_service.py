import json
from .openai_service import generate_quiz
import openai

# ===============================================================
# ADVANCED QUIZ GENERATOR (Difficulty + Explanations + Multi-lang)
# ===============================================================

def generate_advanced_quiz(topic: str, language: str = "English", count: int = 5):
    """
    Create high-quality quiz questions using Bloom's taxonomy,
    multiple difficulty levels, explanations, and multi-language output.
    """

    prompt = f"""
    Create a high-quality educational quiz.

    Topic: "{topic}"
    Language: {language}
    Number of Questions: {count}

    FOLLOW THIS EXACT JSON FORMAT ONLY:
    [
      {{
        "question": "...",
        "type": "mcq | true_false | fill_blank | scenario",
        "difficulty": "easy | medium | hard",
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "explanation": "Explain why this answer is correct in {language}."
      }}
    ]

    RULES:
    - Questions must follow Bloom’s taxonomy: remembering, understanding, application, analysis, evaluation.
    - At least 1 question should be scenario-based.
    - At least 1 should be higher-order thinking (analysis/evaluation).
    - Options must be meaningful and non-repetitive.
    - Ensure explanations are clear and helpful.
    - MUST return ONLY pure JSON, no markdown, no backticks.
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You generate structured JSON educational quizzes."},
                {"role": "user", "content": prompt}
            ]
        )

        content = response.choices[0].message["content"]
        content = content.replace("```", "").replace("json", "")
        return json.loads(content)

    except Exception as e:
        print("Quiz generation error:", e)
        return []
        


# Wrapper used in lesson generator
def generate_quiz_questions(topic: str, language="English", count: int = 5):
    return generate_advanced_quiz(topic, language, count)
