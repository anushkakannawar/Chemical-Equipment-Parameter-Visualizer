import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

username = 'admin'
password = 'password123'

try:
    user, created = User.objects.get_or_create(username=username)
    user.set_password(password)
    if not user.email:
        user.email = 'admin@example.com'
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"Password for '{username}' has been set to '{password}'.")
except Exception as e:
    print(f"Error: {e}")
