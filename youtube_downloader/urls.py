from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# from .views import HomeView
from .views import VideoListView, VideoDownloadRequestView, HomePageView

urlpatterns = [
    path("videos", VideoListView.as_view(), name="video_list"),
    path("videos/download", VideoDownloadRequestView.as_view(), name="video_download"),
    path("", HomePageView.as_view(), name="home"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)