from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import SignUpForm
from django.contrib import messages
from django.http import JsonResponse
import random
from .defaults import MONSTER_IMAGES, all_moves, pc_stats_o, GITHUB_API_URL, GITHUB_REWARDS, LEETCODE_REWARDS, LEETSCAN_API_URL
import requests
import os
import json
from datetime import datetime  # Ensure correct import


# Create your views here.
def home(request):
    if request.user.is_authenticated:
        return render(request, "main_menu.html", {'name' : request.user.username, 'stats' : request.user.stats})
    
    return redirect('/login/')

def loginUser(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            print(f"User {user.username} logged in successfully")
            login(request, user)
            return redirect('/')
        elif not request.user.is_authenticated:
            messages.error(request, "Invalid credentials, Please try Again!")
        
    return render(request, "login.html")

def signupUser(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        
        if form.is_valid():
            user = form.save(commit=False)
            user.username = form.cleaned_data['username']
            user.email = form.cleaned_data['email']
            user.set_password(form.cleaned_data['password'])
            user.save()
            print(f"User {user.username} created successfully")
            messages.success(request, "Account created successfully!")
            return redirect('/login/')
        else:
            print("error occured")
        
    return redirect('/login/')  # Added trailing slash


def logoutUser(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect('/login/')
    
    return redirect('/login/')  # Added trailing slash

def battle(request):
    if request.user.is_authenticated:
            # Get user stats from session
        user_monster = random.choice(MONSTER_IMAGES)
        pc_monster = random.choice(MONSTER_IMAGES)
        
        # Make sure user and PC don't get the same monster
        while pc_monster == user_monster:
            pc_monster = random.choice(MONSTER_IMAGES)
        
        # Select 4 random moves for user and PC
        user_moves = random.sample(all_moves, 4)
        # user_moves = json.dumps(user_moves, indent=4)  # Convert to JSON string for storage
        pc_moves = random.sample(all_moves, 4)
        
        user_stats = request.user.stats.copy()
        pc_stats = pc_stats_o.copy()
        return render(request, "battle.html", {
            'user_monster':   user_monster,
            'pc_monster'  :   pc_monster,
            'user_stats'  :   user_stats,
            'pc_stats'    :   pc_stats,
            'user_moves'  :   user_moves,
            'pc_moves'    :   pc_moves,
            'name'        :   request.user.username
        })
    
    return redirect('/login/')  # Added trailing slash

def github(request):
    if request.user.is_authenticated:
        user = request.user
    
    # Check if user has GitHub account linked
    if not user.github_credentials:
        return render(request, 'github.html')
    
    github_credentials = user.github_credentials
    github_username = github_credentials.get('github_username')
    last_update = github_credentials.get('last_update')
    github_avatar = github_credentials.get('github_avatar')
    github_bio = github_credentials.get('github_bio')
    commits_stats = github_credentials.get('commit_stats', {})
    commits_diff = github_credentials.get('commits_diff', 0)
    rewards = github_credentials.get('rewards', [])
    recent_commits = github_credentials.get('recent_commits', [])
    

    return render(request, 'github.html', {
        'github_username': github_username,
        'last_update': last_update,
        'github_avatar': github_avatar,
        'github_bio': github_bio,
        'commits_stats': commits_stats,
        'commits_diff': commits_diff,
        'recent_commits': recent_commits,
        'rewards': rewards
    })
    


GITHUB_API_URL = "https://api.github.com/"

def link_github_account(request):
    if request.user.is_anonymous:
        return redirect('/login/')
    if request.method == 'POST':
        headers = {}
        username = request.POST.get('github_username')
        if not username:
            return JsonResponse({'status': 'error', 'message': 'GitHub username is required'}, status=400)

        # Fetch GitHub profile data
        profile_response = requests.get(f"{GITHUB_API_URL}users/{username}")
        profile_data = profile_response.json()

        repos_response = requests.get(f"{GITHUB_API_URL}users/{username}/repos", headers=headers)
        repos_data = repos_response.json() if repos_response.status_code == 200 else []
        
        # Fetch recent commits (we'll need to check each repository)
        recent_commits = []
        total_commits = 0
        
        for repo in repos_data[:5]:  # Limit to 5 repos to avoid rate limits
            repo_name = repo['name']
            commits_url = f"{GITHUB_API_URL}repos/{username}/{repo_name}/commits"
            commits_response = requests.get(commits_url, headers=headers)
            
            if commits_response.status_code == 200:
                repo_commits = commits_response.json()
                total_commits += len(repo_commits)
                
                # Add recent commit info
                for commit in repo_commits[:3]:  # Get top 3 recent commits per repo
                    commit_data = {
                        'repo': repo_name,
                        'message': commit['commit']['message'],
                        'date': commit['commit']['author']['date']
                    }
                    recent_commits.append(commit_data)
        
        # Calculate streak (simplified version - actual calculation would be more complex)
        # This is a placeholder - real implementation would analyze commit dates
        streak = min(7, total_commits // 5)  # Just a simple formula for example
        
        # Prepare stats
        stats = {
            'total_commits': total_commits,
            'recent_commits': len(recent_commits),
            'streak': streak
        }
        
        user = request.user
        github_credentials = {
            'github_username': username,
            'github_avatar': profile_data.get('avatar_url', ''),
            'github_bio': profile_data.get('bio', ''),
            'commit_stats': stats,
            'commits_diff': stats['total_commits'] - user.github_credentials.get('total_commits', 0),
            'last_update': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'rewards': [],  # Placeholder for rewards logic
            'recent_commits': recent_commits
        }
        # Update user profile with GitHub data
        user.github_credentials.update(github_credentials)
        user.save()
        print("user saved")
    return redirect('/github/')  # Redirect to GitHub page if not a POST request
    

def refresh_github_stats(request):
    if request.user.is_anonymous:
        return redirect('/login/')
    
    user = request.user
    github_credentials = user.github_credentials.copy()
    old_stats = github_credentials.get('commit_stats', {})
    username = github_credentials.get('github_username')
    
    if not username:
        return JsonResponse({'status': 'error', 'message': 'GitHub account not linked'}, status=400)
    
    # Fetch updated GitHub stats and rewards logic here
    # This is a placeholder - real implementation would fetch from GitHub API
    
    headers = {}
    try:
        if os.getenv('GITHUB_TOKEN'):
            headers['Authorization'] = f'token {os.getenv("GITHUB_TOKEN")}'
            
        # Fetch user profile from GitHub API
        profile_response = requests.get(f"{GITHUB_API_URL}users/{username}", headers=headers)
        
        if profile_response.status_code != 200:
            return json({'status': 'error', 'message': 'Failed to fetch GitHub profile'})
        
        profile_data = profile_response.json()
        
        # Fetch user repositories
        repos_response = requests.get(f"{GITHUB_API_URL}users/{username}/repos", headers=headers)
        repos_data = repos_response.json() if repos_response.status_code == 200 else []
        
        # Fetch recent commits (we'll need to check each repository)
        recent_commits = []
        total_commits = 0
        
        for repo in repos_data[:5]:  # Limit to 5 repos to avoid rate limits
            repo_name = repo['name']
            commits_url = f"{GITHUB_API_URL}repos/{username}/{repo_name}/commits"
            commits_response = requests.get(commits_url, headers=headers)
            
            if commits_response.status_code == 200:
                repo_commits = commits_response.json()
                total_commits += len(repo_commits)
                
                # Add recent commit info
                for commit in repo_commits[:3]:  # Get top 3 recent commits per repo
                    commit_data = {
                        'repo': repo_name,
                        'message': commit['commit']['message'],
                        'date': commit['commit']['author']['date']
                    }
                    recent_commits.append(commit_data)
        
        # Calculate streak (simplified version - actual calculation would be more complex)
        # This is a placeholder - real implementation would analyze commit dates
        streak = min(7, total_commits // 5)  # Just a simple formula for example
        
        # Prepare stats
        new_stats = {
            'total_commits': total_commits,
            'recent_commits': len(recent_commits),
            'streak': streak
        }
        
        # Calculate difference in commits
        commits_diff = max(0, new_stats['total_commits'] - old_stats['total_commits'])
        
        # Calculate rewards
        rewards = []
        
        if commits_diff > 0:
            # Calculate streak bonus
            streak_bonus = min(
                GITHUB_REWARDS['commit']['streak_bonus'] * new_stats['streak'],
                GITHUB_REWARDS['commit']['max_streak_bonus']
            )
            
            # Total reward value per commit
            reward_per_commit = GITHUB_REWARDS['commit']['value'] + streak_bonus
            
            # For each new commit
            for _ in range(commits_diff):
                # Randomly select a stat to improve
                stat = random.choice(['HP', 'atk', 'def', 'spA', 'spD', 'Spe'])
                
                # Add to rewards list
                rewards.append({
                    'stat': stat,
                    'value': reward_per_commit
                })
            
            github_credentials['rewards'] = rewards
            github_credentials['commits_diff'] = commits_diff
            github_credentials['commit_stats'] = new_stats
            github_credentials['recent_commits'] = recent_commits
            github_credentials['last_update'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
            user.github_credentials = github_credentials
            user.save()
    except Exception as e:
        print(f"Error fetching GitHub stats: {e}")
        return JsonResponse({'status': 'error', 'message': 'Failed to refresh GitHub stats'}, status=500)
    
    return JsonResponse({'status': 'success', 'message': 'GitHub stats refreshed'})
    

def leetcode(request):
    if request.user.is_anonymous:
        return redirect('/login/')
    
    # Fetch linked LeetCode account data
    leetcode_credentials = request.user.leetcode_credentials.copy()
    if leetcode_credentials is {}:
        return render(request, 'leetcode.html')
            
    leetcode_username = leetcode_credentials.get('leetcode_username', '')
    leetcode_account = leetcode_credentials.get('leetcode_account', None)
    last_update = leetcode_credentials.get('last_update') if leetcode_credentials.get('last_update') else 'Never'
    if leetcode_account is None:
        return render(request, 'leetcode.html')
        
    # Get current stats
    current_stats = leetcode_credentials.get('stats') or {
        'total': 0,
        'easy': 0,
        'medium': 0,
        'hard': 0
    }
    print(current_stats)
        
    # Get solved diff
    solved_diff = leetcode_credentials.get('solved_diff') or {
        'total': 0,
        'easy': 0,
        'medium': 0,
        'hard': 0
    }
        
    # Get rewards
    rewards = leetcode_credentials.get('rewards') or []


    # Render template with context
    return render(request, 'leetcode.html', {
        'leetcode_username': leetcode_username,
        'last_update': last_update,
        'current_stats': current_stats,
        'solved_diff': solved_diff,
        'rewards': rewards
    })
    
def link_leetcode_account(request):
    if request.user.is_anonymous:
        return redirect('/login/')

    if request.method == 'POST':
        username = request.POST.get('leetcode_username')
        if not username:
            return JsonResponse({'status': 'error', 'message': 'LeetCode username is required'}, status=400)
        
        response = requests.get(LEETSCAN_API_URL + username)
        leetcode_data = response.json()
        
        if 'error' in leetcode_data:
            return json({'status': 'error', 'message': 'Invalid LeetCode username'})
        
        # Extract solving count
        solving_count = leetcode_data #
        
        stats = {
            'total': solving_count.get('totalSolved', 0),
            'easy': solving_count.get('easySolved', 0),
            'medium': solving_count.get('mediumSolved', 0),
            'hard': solving_count.get('hardSolved', 0)
        }
        
        request.user.leetcode_credentials = {
            'leetcode_username': username,
            'leetcode_account': leetcode_data,
            'last_update': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'stats': stats,
            'solved_diff': stats,  # Assuming new users have no previous stats
            'rewards': []  # Placeholder for rewards logic
        }
        request.user.save()
        print("user saved")
    
    return redirect('/leetcode/')  # Redirect to LeetCode page if not a POST request

def refresh_leetcode_stats(request):
    if request.user.is_anonymous:
        return redirect('/login/')
    
    user = request.user
    if not user or user.leetcode_credentials.get('leetcode_username') is None:
        return json({'status': 'error', 'message': 'LeetCode account not linked'})
    
    credentials = user.leetcode_credentials.copy()
    username = credentials['leetcode_username']
    old_stats = credentials.get('stats', {
        'total': 0,
        'easy': 0,
        'medium': 0,
        'hard': 0
    })
    
    old_solved_diff = credentials.get('solved_diff', {
        'total': 0,
        'easy': 0,
        'medium': 0,
        'hard': 0
    })
    
    rewards = credentials.get('rewards', [])
    
    # Fetch updated LeetCode stats and rewards logic here
    # This is a placeholder - real implementation would fetch from LeetCode API
    response = requests.get(LEETSCAN_API_URL + username)
    
    leetcode_data = response.json()
        
    if 'error' in leetcode_data:
        return json({'status': 'error', 'message': 'Failed to fetch LeetCode data'})
        
    # Extract solving count
    solving_count = leetcode_data #
        
    new_stats = {
        'total': solving_count.get('totalSolved', 0),
        'easy': solving_count.get('easySolved', 0),
        'medium': solving_count.get('mediumSolved', 0),
        'hard': solving_count.get('hardSolved', 0)
    }
        
    # Calculate differences
    solved_diff = {
        'total': max(0, new_stats['total'] - old_stats['total']),
        'easy': max(0, new_stats['easy'] - old_stats['easy']),
        'medium': max(0, new_stats['medium'] - old_stats['medium']),
        'hard': max(0, new_stats['hard'] - old_stats['hard'])
    }
        
    # Calculate rewards
    rewards = []
        
    # For each difficulty level
    for difficulty in ['easy', 'medium', 'hard']:
        if solved_diff[difficulty] > 0:
            # For each problem solved
            for _ in range(solved_diff[difficulty]):
                # Determine reward amount
                reward_amount = LEETCODE_REWARDS[difficulty]
                    
                # Randomly select a stat to improve
                stat = random.choice(['HP', 'atk', 'def', 'spA', 'spD', 'Spe'])
                    
                # Add to rewards list
                rewards.append({
                    'stat': stat,
                    'value': reward_amount
                })
        
        # Update user in database
        user.leetcode_credentials.update({
            'stats': new_stats,
            'solved_diff': solved_diff,
            'rewards': rewards,
            'last_update': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        
        user.save()
        print("user saved")
        
    return JsonResponse({'status': 'success', 'message': 'LeetCode stats refreshed'})
    
    
def pomodoro(request):
    if request.user.is_authenticated:
        return render(request, "pomodoro.html", {'name' : request.user.username})
    
    return redirect('/login/')  # Added trailing slash

def claim_github_rewards(request):
    if request.user.is_anonymous:
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=401)

    user = request.user
    github_credentials = user.github_credentials

    if not github_credentials or not github_credentials.get('rewards'):
        return JsonResponse({'status': 'error', 'message': 'No rewards available to claim'}, status=400)

    rewards = github_credentials.get('rewards', [])
    for reward in rewards:
        stat = reward['stat']
        value = reward['value']
        user.stats[stat] = user.stats.get(stat, 0) + value  # Update user stats

    # Clear claimed rewards
    github_credentials['rewards'] = []
    user.github_credentials = github_credentials
    user.save()

    return JsonResponse({'status': 'success', 'message': 'Rewards claimed successfully'})

def claim_leetcode_rewards(request):
    if request.user.is_anonymous:
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=401)

    user = request.user
    leetcode_credentials = user.leetcode_credentials.copy()

    if not leetcode_credentials or not leetcode_credentials.get('rewards'):
        return JsonResponse({'status': 'error', 'message': 'No rewards available to claim'}, status=400)

    rewards = leetcode_credentials.get('rewards', [])
    for reward in rewards:
        stat = reward['stat']
        value = reward['value']
        user.stats[stat] = user.stats.get(stat, 0) + value  # Update user stats

    # Clear claimed rewards
    leetcode_credentials['rewards'] = []
    user.leetcode_credentials = leetcode_credentials
    user.save()
    print("user updated")

    return JsonResponse({'status': 'success', 'message': 'Rewards claimed successfully'}, status=200)

