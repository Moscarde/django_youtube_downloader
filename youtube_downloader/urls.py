from django.urls import path

# from .views import HomeView
from .views import VideoListView, VideoDownloadRequestView

urlpatterns = [
    path("videos", VideoListView.as_view(), name="video_list"),
    path("videos/download", VideoDownloadRequestView.as_view(), name="video_download"),
]