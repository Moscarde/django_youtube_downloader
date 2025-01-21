from django.urls import path

# from .views import HomeView
from .views import VideoListView, VideoDownloadRequestView, HomePageView

urlpatterns = [
    path("videos", VideoListView.as_view(), name="video_list"),
    path("videos/download", VideoDownloadRequestView.as_view(), name="video_download"),
    path("", HomePageView.as_view(), name="home"),
]

