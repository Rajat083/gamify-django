from django.urls import path
from . import views
# from .views import link_github_account

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.loginUser, name='login'),
    path('signup/', views.signupUser, name='signup'),
    path('logout/', views.logoutUser, name='logout'),
    path('battle/', views.battle, name='battle'),
    path('github/', views.github, name='github'),
    path('github/link-account', views.link_github_account, name='link_github_account'),
    path('github/refresh-stats', views.refresh_github_stats, name='refresh_github_stats'),
    path('github/claim-rewards', views.claim_github_rewards, name='claim_github_rewards'),
    path('leetcode/', views.leetcode, name='leetcode'),
    path('leetcode/link-account', views.link_leetcode_account, name='link_leetcode_account'),
    path('leetcode/refresh-stats', views.refresh_leetcode_stats, name='refresh_leetcode_stats'),
    path('leetcode/claim-rewards', views.claim_leetcode_rewards, name='claim_leetcode_rewards'),
    path('pomodoro/', views.pomodoro, name='pomodoro'),
]