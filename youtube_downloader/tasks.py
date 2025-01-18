import re

from celery import shared_task
from yt_dlp import YoutubeDL

from .models import Video


@shared_task
def download_youtube_video(video_url, output_path="."):
    youtube_regex = re.compile(
        r"(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/.+$"
    )

    if not youtube_regex.match(video_url):
        raise ValueError("A URL fornecida não é uma URL válida do YouTube.")

    video_info = get_video_info(video_url)
    video = Video.objects.create(
        url=video_url,
        title=video_info["title"],
        file_path="",
        duration_s=video_info["duration"],
        views=video_info["view_count"],
        upload_date=video_info["upload_date"],
        uploader=video_info["uploader"],
        status="Pendente",
    )

    if download_video(video_url, output_path):
        video.status = "Baixado"
        video.file_path = f"{output_path}/{video.title}.mp4"
        video.save()

    


def get_video_info(video_url):
    options = {
        "quiet": True,
        "no_warnings": True,
        "format": "best",
    }
    with YoutubeDL(options) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict

def download_video(video_url, output_path):
    options = {
        "outtmpl": f"{output_path}/%(title)s.%(ext)s",  # Nome do arquivo de saída
        "format": "bestvideo+bestaudio/best",  # Melhor qualidade disponível
    }
    try:
        with YoutubeDL(options) as ydl:
            ydl.download([video_url])
        print("Download concluído!")
        return True
    except Exception as e:
        print(f"Erro ao baixar o vídeo: {e}")
        return False