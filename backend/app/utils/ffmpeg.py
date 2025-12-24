import moviepy.editor as mp
import uuid

def create_video(frames):
    """
    Create a video from frames using correct codec for browsers
    """

    clips = [mp.ImageClip(f).set_duration(1.5) for f in frames]
    final = mp.concatenate_videoclips(clips)

    output = f"video_{uuid.uuid4()}.mp4"

    final.write_videofile(
        output,
        fps=24,
        codec="libx264",
        audio=False,
        ffmpeg_params=[
            "-pix_fmt", "yuv420p",
            "-profile:v", "baseline",
            "-level", "3.0"
        ]
    )

    return output
