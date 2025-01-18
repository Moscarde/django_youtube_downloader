from django.db import models
import os


# Create your models here.
class Video(models.Model):
    url = models.URLField(unique=False)
    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, null=True, blank=True)
    duration_s = models.PositiveIntegerField(null=True, blank=True)
    views = models.PositiveIntegerField(null=True, blank=True)
    upload_date = models.DateField(null=True, blank=True)
    uploader = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("Pendente", "Pendente"),
            ("Baixado", "Baixado"),
            ("Excluído", "Excluído"),
        ],
        default="Pendente",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title

    def delete_file(self):
        if self.file_path and os.path.exists(self.file_path):
            os.remove(self.file_path)
            self.status = "Excluído"
            self.file_path = ""
            self.save()
            print(f"Arquivo do vídeo '{self.title}' excluído com sucesso!")
        else:
            print(f"O arquivo '{self.file_path}' não existe ou já foi excluído.")