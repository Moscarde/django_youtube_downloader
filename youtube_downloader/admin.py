from django.contrib import admin
from .models import Video

# Register your models here.
@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):

    list_display = ("title", "status", "created_at")
    search_fields = ("title",)
    list_filter = ("status", "created_at")