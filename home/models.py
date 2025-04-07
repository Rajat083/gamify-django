from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from .defaults import DEFAULT_STATS

def get_default_stats():
    return DEFAULT_STATS.copy()  # Use a callable function for default

class UserManager(BaseUserManager):
    def create_user(self,username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create and return a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)

    def get_by_natural_key(self, email):
        return self.get(email=email)  # Fetch user by email

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    stats = models.JSONField(default=get_default_stats)  # Replace lambda with callable function
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    github_credentials = models.JSONField(default=dict, null=True, blank=True)  # Store GitHub credentials as JSON
    leetcode_credentials = models.JSONField(default=dict, null=True, blank=True)  # Store LeetCode credentials as JSON
    monkeytype_credentials = models.JSONField(default=dict, null=True, blank=True)  # Store MonkeyType credentials as JSON
    objects = UserManager()  # Use the custom manager

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

    def set_stats(self, stats):
        if self.stats is None:
            self.stats = get_default_stats()
        else:
            self.stats.update(stats)
        self.save()

    def get_stats(self):
        return self.stats if self.stats else get_default_stats()

