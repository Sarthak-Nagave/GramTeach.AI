# backend/app/utils/text_processing.py

import re
import wave
import os
import contextlib
from pathlib import Path

# Regex to detect scene markers like: [SCENE 1]
SCENE_SPLIT_RE = re.compile(r'\[SCENE\s*\d+\]', flags=re.IGNORECASE)


# -------------------------------------------------------------
# 🔊 FALLBACK: CREATE SILENT AUDIO (1 SECOND WAV)
# -------------------------------------------------------------
def create_silent_audio(uid: str) -> str:
    """
    Creates a 1-second silent WAV file.
    Returns absolute path to .wav file.
    """
    out_dir = Path("./tmp_audio")
    out_dir.mkdir(parents=True, exist_ok=True)
    filepath = out_dir / f"silent-{uid}.wav"

    framerate = 44100
    duration = 1  # seconds
    nframes = int(duration * framerate)

    # Write mono 16-bit PCM silent file
    with wave.open(str(filepath), 'wb') as wf:
        wf.setnchannels(1)        # mono
        wf.setsampwidth(2)        # 16-bit audio
        wf.setframerate(framerate)
        wf.writeframes(b'\x00\x00' * nframes)  # silent frames

    # Double-check file length (optional)
    try:
        with contextlib.closing(wave.open(str(filepath), 'r')) as w:
            w.getnframes()
    except Exception:
        if filepath.exists():
            filepath.unlink()
        raise

    return str(filepath.resolve())


# -------------------------------------------------------------
# 🖼️ FALLBACK IMAGE (used when Stability fails)
# -------------------------------------------------------------
def create_fallback_image(uid: str) -> str:
    """
    Generates a guaranteed valid placeholder image and returns its path.
    Uses Pillow if available; otherwise writes a minimal PNG fallback.
    """
    out_dir = Path("./tmp")
    out_dir.mkdir(parents=True, exist_ok=True)
    file_path = out_dir / f"fallback-{uid}.png"

    try:
        from PIL import Image
        img = Image.new("RGB", (1024, 1024), (25, 25, 25))
        img.save(str(file_path))
        return str(file_path.resolve())
    except Exception:
        # Minimal binary PNG fallback (1x1 black PNG expanded by ffmpeg later)
        try:
            png_bytes = (
                b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
                b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00'
                b'\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00\x01'
                b'\xe2!\xbc\x33\x00\x00\x00\x00IEND\xaeB`\x82'
            )
            with open(str(file_path), "wb") as f:
                f.write(png_bytes)
            return str(file_path.resolve())
        except Exception:
            # Last resort: return path string (caller must handle)
            return str(file_path.resolve())


# -------------------------------------------------------------
# 📘 PARSE SCRIPT INTO SCENES
# -------------------------------------------------------------
def parse_script_to_scenes(script_text: str):
    """
    Extracts scenes from the generated script.
    Expected format:

    [SCENE 1]
    (Visual Description: ...)
    Narrator: text...

    Returns list of dicts:
      [{"visual_prompt": "...", "narration": "..."}]
    """
    if not script_text:
        return []

    text = script_text.replace("\r\n", "\n").strip()

    # Split based on [SCENE X]
    parts = SCENE_SPLIT_RE.split(text)
    markers = SCENE_SPLIT_RE.findall(text)

    scenes = []

    # If no SCENE markers found → fallback parsing
    if not markers:
        lines = text.split("\n")
        cur_visual = None
        cur_narration = None

        for ln in lines:
            ln_strip = ln.strip()

            if ln_strip.lower().startswith("(") and "visual" in ln_strip.lower():
                cur_visual = ln_strip

            elif ln_strip.lower().startswith("narrator:"):
                cur_narration = ln_strip.split(":", 1)[1].strip()
                scenes.append({
                    "visual_prompt": cur_visual or "",
                    "narration": cur_narration or ""
                })
                cur_visual = None
                cur_narration = None

        return scenes

    # Normal parsing using markers
    for part in parts[1:]:
        block = part.strip()
        if not block:
            continue

        visual = ""
        narration = ""

        # Extract visual description (first parenthesis block)
        vis_match = re.search(r'\((.*?)\)', block, flags=re.DOTALL)
        if vis_match:
            visual = vis_match.group(1).strip()

        # Extract narrator text: take first narrator line
        nar_match = re.search(r'Narrator\s*:\s*(.*)', block, flags=re.IGNORECASE | re.DOTALL)
        if nar_match:
            narration = nar_match.group(1).strip().split("\n")[0].strip()

        # Fallback for narration: first non-empty line
        if not narration:
            for ln in block.split("\n"):
                ln = ln.strip()
                if ln:
                    narration = ln
                    break

        scenes.append({
            "visual_prompt": visual,
            "narration": narration
        })

    return scenes
