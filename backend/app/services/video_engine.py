# backend/app/services/video_engine.py

import os
import tempfile
from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    VideoFileClip,
    concatenate_videoclips
)
from PIL import Image

# Final video output folder
FINAL_VIDEOS_DIR = "./final_videos"
os.makedirs(FINAL_VIDEOS_DIR, exist_ok=True)

# Thumbnail output folder
FINAL_THUMB_DIR = "./final_thumbnails"
os.makedirs(FINAL_THUMB_DIR, exist_ok=True)


# ----------------------------------------------------------
# IMAGE SAFETY HANDLER
# ----------------------------------------------------------
def _safe_convert_image(img_path):
    """Converts image to RGB to avoid moviepy crashes."""
    try:
        img = Image.open(img_path)
        if img.mode != "RGB":
            img = img.convert("RGB")
            img.save(img_path)
        img.close()
    except Exception:
        pass


# ----------------------------------------------------------
# THUMBNAIL GENERATION
# ----------------------------------------------------------
def extract_thumbnail(video_path, thumb_name):
    """
    Extracts a frame from the generated video and saves as a JPG thumbnail.
    Returns: thumbnail_path or None
    """
    try:
        clip = VideoFileClip(video_path)
        frame = clip.get_frame(1)  # frame at 1 second
        clip.close()

        from PIL import Image
        import numpy as np

        # Convert numpy frame to PIL image
        img = Image.fromarray(frame)
        thumb_path = os.path.join(FINAL_THUMB_DIR, thumb_name)
        img.save(thumb_path, "JPEG", quality=85)

        print(f"📸 Thumbnail generated: {thumb_path}")
        return thumb_path

    except Exception as e:
        print("❌ Thumbnail extraction failed:", e)
        return None


# ----------------------------------------------------------
# MAIN VIDEO GENERATION PIPELINE
# ----------------------------------------------------------
def generate_video(scenes, output_filename):
    """
    scenes: list of {"image": path, "audio": path, "subtitle": text}
    returns: video_path (thumbnail handled separately)
    """
    print("🎥 [VIDEO_ENGINE] Rendering started...")

    clips = []

    # Temporary directory for MoviePy processing
    with tempfile.TemporaryDirectory() as tmpdir:

        for idx, scene in enumerate(scenes):
            img_path = scene.get("image")
            audio_path = scene.get("audio")

            print(f"→ Scene {idx}: image={img_path}, audio={audio_path}")

            if not img_path or not os.path.exists(img_path):
                print("❌ Missing image -> skipping")
                continue

            _safe_convert_image(img_path)

            # LOAD IMAGE CLIP
            try:
                clip = ImageClip(img_path).resize(height=720)
            except Exception as e:
                print("❌ ImageClip failed:", e)
                continue

            # ATTACH AUDIO
            try:
                if audio_path and os.path.exists(audio_path):
                    audio = AudioFileClip(audio_path)
                    clip = clip.set_audio(audio)
                    clip = clip.set_duration(audio.duration)
                else:
                    clip = clip.set_duration(2)
            except Exception as e:
                print("❌ Audio attach failed:", e)
                clip = clip.set_duration(2)

            clips.append(clip)

        if not clips:
            raise Exception("❌ No valid scenes to render")

        # CONCAT VIDEOS
        print("🎬 Concatenating scenes...")
        try:
            final = concatenate_videoclips(clips, method="compose")
        except Exception as e:
            print("⚠ Concatenate failed:", e)
            raise

        # EXPORT FINAL VIDEO
        output_path = os.path.join(FINAL_VIDEOS_DIR, output_filename)

        try:
            final.write_videofile(
                output_path,
                fps=24,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile=os.path.join(tmpdir, "temp-audio.m4a"),
                remove_temp=True,
                threads=0,
            )
        finally:
            # Cleanup
            try:
                final.close()
            except:
                pass
            for c in clips:
                try:
                    c.close()
                except:
                    pass

    print("✅ Render complete:", output_path)
    return output_path
