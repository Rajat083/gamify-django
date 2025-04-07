import random
# Default stats for new users
DEFAULT_STATS = {
    "HP": 20,
    "atk": 5,
    "def": 5,
    "spA": 5,
    "spD": 5,
    "Spe": 5
}

MONSTER_IMAGES = ['Atrox', 'Charmadillo', 'Cindrill', 'Cleaf', 'Draem', 'Finiette', 'Finsta', 'Friolera', 'Gulfin', 'Ivieron', 'Jacana', 'Larvae', 'Pluma', 'Plumette', 'Pouch', 'Sparchu']

# Activity rewards configuration
ACTIVITY_REWARDS = {
    'github': {
        'HP': 1,
        'atk': 0.5,
        'def': 0.5,
        'spA': 1,
        'spD': 0.5,
        'Spe': 0.5
    },
    'reading': {
        'HP': 0.5,
        'atk': 0.5,
        'def': 0.5,
        'spA': 1,
        'spD': 1,
        'Spe': 0.5
    },
    'pomodoro': {
        'HP': 0.5,
        'atk': 0.5,
        'def': 1,
        'spA': 0.5,
        'spD': 0.5,
        'Spe': 1
    }
}

# Stat increase for LeetCode problems by difficulty
LEETCODE_REWARDS = {
    'easy': 0.5,
    'medium': 1.0,
    'hard': 2.0
}

# LeetScan API base URL
LEETSCAN_API_URL = "https://leetscan.vercel.app/"

# GitHub API base URL
GITHUB_API_URL = "https://api.github.com/"

# GitHub reward configuration
GITHUB_REWARDS = {
    'commit': {
        'value': 0.5,  # Base value per commit
        'streak_bonus': 0.1,  # Additional value per day in streak
        'max_streak_bonus': 1.0  # Maximum streak bonus
    }
}

all_moves = [
        {"id": "slash", "name": "Slash", "type": "physical", "priority": 0},
        {"id": "hyperbeam", "name": "Hyper Beam", "type": "special", "priority": 0},
        {"id": "quickattack", "name": "Quick Attack", "type": "physical", "priority": 1},
        {"id": "mudshot", "name": "Mud Shot", "type": "physical", "priority": 0, "side_effect": "speed"},
        {"id": "protect", "name": "Protect", "type": "status", "priority": 0},
        {"id": "counter", "name": "Counter", "type": "physical", "priority": -1},
        {"id": "drain", "name": "Drain", "type": "mixed", "priority": 0, "side_effect": "heal"}
    ]


pc_stats_o = {
        "HP": random.randint(15, 25),
        "atk": random.randint(4, 7),
        "def": random.randint(4, 7),
        "spA": random.randint(4, 7),
        "spD": random.randint(4, 7),
        "Spe": random.randint(4, 7)
    }

