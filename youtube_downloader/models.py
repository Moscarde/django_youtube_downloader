from django.db import models


# Create your models here.
class Video(models.Model):
    url = models.URLField(unique=True)
    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, null=True, blank=True)
    duration_s = models.PositiveIntegerField(null=True, blank=True)
    views = models.PositiveIntegerField(null=True, blank=True)
    upload_date = models.DateField(null=True, blank=True)
    uploader = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("Pendente", "Pendente"), ("Baixado", "Baixado")],
        default="Pendente",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
