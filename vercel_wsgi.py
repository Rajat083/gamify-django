# vercel_wsgi.py
import sys
import os

from django.core.wsgi import get_wsgi_application

sys.path.append(os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gamify.settings")

app = get_wsgi_application()
