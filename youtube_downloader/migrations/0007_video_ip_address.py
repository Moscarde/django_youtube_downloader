# Generated by Django 5.1.4 on 2025-01-18 18:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("youtube_downloader", "0006_alter_video_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="video",
            name="ip_address",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
