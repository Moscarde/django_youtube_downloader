import os
import re

from celery import shared_task
from slugify import slugify
from yt_dlp import YoutubeDL

from .models import Video
from .utils import is_valid_youtube_url


@shared_task
def download_youtube_video(video_url, output_path="media/videos", ip_address=None):
    if not is_valid_youtube_url(video_url):
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
        thumbnail_url=video_info["thumbnail"],
        status="Pendente",
        ip_address=ip_address,
    )

    if file_path := download_video(video_url, output_path):
        video.status = "Baixado"
        video.file_path = file_path
        video.save()

        delete_video_file.apply_async((video.id,), countdown=2 * 60)
        return f"Vídeo '{video.title}' baixado com sucesso!"


@shared_task
def delete_video_file(video_id):
    try:
        video = Video.objects.get(id=video_id)
        video.delete_file()
        return f"Arquivo do vídeo '{video.title}' excluído com sucesso."
    except Video.DoesNotExist:
        print(f"Vídeo com ID {video_id} não encontrado.")
    except Exception as e:
        print(f"Erro ao excluir o arquivo: {e}")


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
            info_dict = ydl.extract_info(video_url, download=True)
            filename = ydl.prepare_filename(info_dict)
            base_name, ext = os.path.splitext(os.path.basename(filename))
            slugified_name = slugify(base_name)
            slugified_filename = f"{slugified_name}{ext}"
            final_path = os.path.join(os.path.dirname(filename), slugified_filename)
            os.rename(filename, final_path)

        print("Download concluído!")
        return final_path
    except Exception as e:
        print(f"Erro ao baixar o vídeo: {e}")
        return None
