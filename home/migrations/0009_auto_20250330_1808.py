# Generated by Django 3.1.12 on 2025-03-30 12:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0008_auto_20250330_1807'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='leetcode_credentials',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='monkeytype_credentials',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]
