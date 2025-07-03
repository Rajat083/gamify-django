# 🎮 Gamify – Productivity Gamified using Django

**Gamify** is a productivity-enhancing web app that turns your daily goals into a game. Earn XP, complete tasks, and unlock achievements — all while staying focused and motivated.

---

## 🚀 Features

- 📝 Task and goal management
- 🎯 XP system to reward task completion
- 📆 Track your progress with dates and deadlines
- 👤 User authentication (login/register)
- ⚙️ Admin panel to manage users and data
- 🧩 Modular Django apps
- 🔄 Vercel + WSGI + Procfile included for deployment

---

## 🛠️ Tech Stack

- **Backend**: Django
- **Database**: SQLite (can be upgraded to PostgreSQL)
- **Frontend**: HTML5, Bootstrap (optional)
- **Hosting**: Vercel (configured via `vercel.json` and `vercel_wsgi.py`)

---

## 📁 Project Structure

# gamify/
├── manage.py
├── db.sqlite3
├── requirements.txt
├── vercel.json
├── vercel_wsgi.py
├── Procfile
│
├── gamify/ # Django settings and root config
│ ├── settings.py
│ ├── urls.py
│ ├── wsgi.py
│ └── asgi.py
│
├── home/ # Core application
│ ├── models.py # User, Task models with XP logic
│ ├── views.py # Home, login, task completion views
│ ├── forms.py # Custom user forms
│ ├── urls.py
│ ├── admin.py
│ ├── defaults.py
│ └── migrations/


---

## 🔧 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/gamify.git
cd gamify
```

2. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Dependencies
```bash
   pip install -r requirements.txt
```

4. Apply migrations
```bash
python manage.py migrate
```

5. Create Superuser
```bash
python manage.py createsuperuser
```

6. Run the development Server
```bash
python manage.py runserver
```


Visit http://localhost:8000 to explore the app.
Note: In settings.py change allowed hosts to either none or localhost:8000

# Project is depolyed on render with database on railway with postgresql
https://gamify-django.onrender.com

## 🤝 Contributing
Pull requests are welcome! Please open issues for major changes or feature discussions.
