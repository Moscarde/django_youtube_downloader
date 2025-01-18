from django.shortcuts import render
from rest_framework import response, status, views

from .models import Video
from .serializers import VideoSerializer
from .tasks import download_youtube_video
from .utils import is_valid_youtube_url


class VideoListView(views.APIView):
    """Retrieve a list of all videos."""

    def get(self, request):
        videos = Video.objects.all()
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

        download_youtube_video.delay(video_url)
        return response.Response(
            data={"message": "A tarefa de download foi iniciada com sucesso!"},
            status=status.HTTP_202_ACCEPTED,
        )
