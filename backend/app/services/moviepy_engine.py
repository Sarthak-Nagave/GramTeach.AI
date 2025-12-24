import os
os.environ["IMAGEIO_FFMPEG_EXE"] = r"C:\Program Files (x86)\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe"
os.environ["FFMPEG_BINARY"] = r"C:\Program Files (x86)\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe"

from uuid import uuid4
from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
)
from PIL import Image, ImageDraw, ImageFont

TEMP_DIR = "./tmp"
os.makedirs(TEMP_DIR, exist_ok=True)

VIDEO_WIDTH = 1280
VIDEO_HEIGHT = 720
FPS = 30


# ---------------------------
# SUBTITLE RENDERING
# ---------------------------
def draw_subtitle(img, text):
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    import textwrap
    lines = textwrap.wrap(text, width=40)
    y = VIDEO_HEIGHT - 160

    for line in lines:
        w, h = draw.textsize(line, font=font)
        x = (VIDEO_WIDTH - w) // 2
        draw.text((x + 2, y + 2), line, font=font, fill="black")
        draw.text((x, y), line, font=font, fill="white")
        y += h + 10

    return img


# ---------------------------
# PLACEHOLDER IMAGE
# ---------------------------
def placeholder_image(subtitle):
    img = Image.new("RGB", (VIDEO_WIDTH, VIDEO_HEIGHT), (30, 30, 30))
    img = draw_subtitle(img, subtitle)

    out = f"{TEMP_DIR}/placeholder_{uuid4()}.png"
    img.save(out)
    return out


# ---------------------------
# INSERT SUBTITLE ON IMAGE
# ---------------------------
def add_subtitle(image_path, text):
    try:
        img = Image.open(image_path).convert("RGB")
    except:
        img = Image.new("RGB", (VIDEO_WIDTH, VIDEO_HEIGHT), (20, 20, 20))

    img = img.resize((VIDEO_WIDTH, VIDEO_HEIGHT))
    img = draw_subtitle(img, text)

    out = image_path.replace(".png", "_sub.png").replace(".jpg", "_sub.jpg")
    img.save(out)
    return out


# ---------------------------
# FINAL VIDEO GENERATOR
# ---------------------------
def generate_video(scenes, output_path):

    clips = []

    for idx, sc in enumerate(scenes):
        img_path = sc.get("image")
        audio_path = sc.get("audio")
        subtitle = sc.get("narration", "")

        # 1. IMAGE
        if not img_path or not os.path.exists(img_path):
            img_path = placeholder_image(subtitle)

        # 2. SUBTITLE OVERLAY
        final_img = add_subtitle(img_path, subtitle)

        # 3. CLIP
        img_clip = ImageClip(final_img).set_duration(5)

        # 4. AUDIO CLIP
        if audio_path and os.path.exists(audio_path):
            audio_clip = AudioFileClip(audio_path)
            img_clip = img_clip.set_duration(audio_clip.duration)
            img_clip = img_clip.set_audio(audio_clip)

        clips.append(img_clip.fadein(0.5).fadeout(0.5))

    # ---------------------------
    # FINAL CONCAT
    # ---------------------------
    final = concatenate_videoclips(clips, method="compose")
    final = final.resize((VIDEO_WIDTH, VIDEO_HEIGHT))

    final.write_videofile(output_path, fps=FPS, codec="libx264", audio_codec="aac")

    return output_path
