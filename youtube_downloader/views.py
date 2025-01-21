from datetime import timedelta

from django.core.cache import cache
from django.shortcuts import render
from django.utils import timezone
from rest_framework import response, status, views

from .models import Video
from .serializers import VideoSerializer
from .tasks import download_youtube_video
from .utils import is_valid_youtube_url


class VideoListView(views.APIView):
    """Retrieve a list of all videos."""

    def get(self, request):
        ip_address = request.META.get("REMOTE_ADDR")
        now = timezone.now()
        five_minutes_ago = now - timedelta(minutes=5)
        videos = Video.objects.filter(
            ip_address=ip_address, updated_at__gte=five_minutes_ago
        )
        serialized_response = VideoSerializer(videos, many=True).data
        return response.Response(data=serialized_response, status=status.HTTP_200_OK)


class VideoDownloadRequestView(views.APIView):
    """Handle video download requests."""

    def post(self, request):
        video_url = request.data.get("video_url")
        if not video_url:
            return response.Response(
                data={"error": "A URL do vídeo é obrigatória."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not is_valid_youtube_url(video_url):
            return response.Response(
                data={"error": "A URL fornecida não é uma URL válida do YouTube."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ip_address = request.META.get("REMOTE_ADDR")

        # Checando se o vídeo já foi solicitado recentemente pelo mesmo IP
        cache_key = f"video_download_{ip_address}_{video_url}"

        # Armazenando o IP e URL no cache para evitar múltiplas solicitações
        cache.set(cache_key, "requested", timeout=60 * 60)  # 1 hora de timeout

        download_youtube_video.delay(video_url, ip_address=ip_address)

        return response.Response(
            data={"message": "A tarefa de download foi iniciada com sucesso!"},
            status=status.HTTP_202_ACCEPTED,
        )


class HomePageView(views.APIView):
    """Render the homepage with video objects."""

    def get(self, request):
        return render(request, "youtube_downloader/index.html")
