document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const progressBar = document.getElementById('progress-bar');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const sessionCount = document.getElementById('session-count');
    const targetSessions = document.getElementById('target-sessions');
    const sessionIcons = document.getElementById('session-icons');
    const completionMessage = document.getElementById('completion-message');
    const completedCount = document.getElementById('completed-count');
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    const statSelectionModal = document.getElementById('stat-selection-modal');
    const statOptionButtons = document.querySelectorAll('.stat-option-btn');
    
    // Timer variables
    let timer;
    let minutes = 1;  
    let seconds = 0;
    let totalSeconds = minutes * 60;
    let remainingSeconds = totalSeconds;
    let isRunning = false;
    let sessionsCompleted = 0;
    let selectedStats = []; // Array to store selected stats for each session
    const targetSessionCount = 4;
    
    // Initialize session icons
    function initSessionIcons() {
        sessionIcons.innerHTML = '';
        for (let i = 0; i < targetSessionCount; i++) {
            const icon = document.createElement('div');
            icon.className = 'session-icon';
            icon.innerHTML = '<i class="fas fa-check"></i>';
            sessionIcons.appendChild(icon);
        }
        sessionCount.textContent = sessionsCompleted;
        targetSessions.textContent = targetSessionCount;
    }
    
    // Update timer display
    function updateDisplay() {
        minutesDisplay.textContent = String(minutes).padStart(2, '0');
        secondsDisplay.textContent = String(seconds).padStart(2, '0');
        
        // Update progress bar
        const progress = (remainingSeconds / totalSeconds);
        progressBar.style.transform = `scaleX(${progress})`;
    }
    
    // Set timer mode
    function setTimerMode(mode) {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        minutes = mode;
        seconds = 0;
        totalSeconds = minutes * 60;
        remainingSeconds = totalSeconds;
        
        updateDisplay();
    }
    
    // Start timer
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timer = setInterval(function() {
            remainingSeconds--;
            
            minutes = Math.floor(remainingSeconds / 60);
            seconds = remainingSeconds % 60;
            
            updateDisplay();
            
            if (remainingSeconds <= 0) {
                clearInterval(timer);
                isRunning = false;
                
                // Check if it was a Pomodoro session (not a break)
                if (document.getElementById('pomodoro-btn').classList.contains('active')) {
                    completeSession();
                }
                
                // Play sound
                const audio = new Audio('/static/assets/bell.mp3');
                audio.play();
                
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        }, 1000);
    }
    
    // Pause timer
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    // Reset timer
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        const activeMode = document.querySelector('.mode-btn.active');
        minutes = parseInt(activeMode.dataset.time);
        seconds = 0;
        totalSeconds = minutes * 60;
        remainingSeconds = totalSeconds;
        
        updateDisplay();
    }
    
    // Complete a session
    function completeSession() {
        sessionsCompleted++;
        sessionCount.textContent = sessionsCompleted;
        
        // Update session icons
        const icons = document.querySelectorAll('.session-icon');
        if (icons[sessionsCompleted - 1]) {
            icons[sessionsCompleted - 1].classList.add('completed');
        }
        
        // Show stat selection modal
        showStatSelectionModal();
    }
    
    // Show stat selection modal
    function showStatSelectionModal() {
        statSelectionModal.classList.add('show');
    }
    
    // Hide stat selection modal
    function hideStatSelectionModal() {
        statSelectionModal.classList.remove('show');
        
        // Check if all sessions completed
        if (sessionsCompleted >= targetSessionCount) {
            showCompletionMessage();
        }
    }
    
    // Show completion message
    function showCompletionMessage() {
        completedCount.textContent = sessionsCompleted;
        completionMessage.classList.add('show');
    }
    
    // Handle stat selection
    function selectStat(stat) {
        // Add the selected stat to the array
        selectedStats.push(stat);
        
        // Send the stat selection to the server immediately for immediate feedback
        updateUserStat(stat);
        
        // Hide the stat selection modal
        hideStatSelectionModal();
    }
    
    // Update a single user stat
    function updateUserStat(stat) {
        // Calculate the gain (HP gets +1, other stats get +0.5)
        const gain = stat === 'HP' ? 1.0 : 0.5;
        
        fetch('/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activity_type: 'pomodoro',
                single_stat: stat,
                stat_gain: gain
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Show a small notification of success
                const notification = document.createElement('div');
                notification.className = 'stat-notification';
                notification.textContent = `+${gain} ${stat}`;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);
                
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    // Claim rewards
    function claimRewards() {
        // Since we've already updated the stats individually
        // We just need to close the completion message and reset the session
        
        // Reset sessions
        sessionsCompleted = 0;
        selectedStats = [];
        initSessionIcons();
        completionMessage.classList.remove('show');
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'completion-notification';
        notification.textContent = 'Great job! All rewards claimed.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    claimRewardBtn.addEventListener('click', claimRewards);
    
    // Stat option button listeners
    statOptionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stat = this.getAttribute('data-stat');
            selectStat(stat);
        });
    });
    
    // Mode button listeners
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            setTimerMode(parseInt(this.dataset.time));
        });
    });
    
    // Initialize
    initSessionIcons();
    updateDisplay();
    
    // Add the CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .stat-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, orange, darkorange);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 1.2rem;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .stat-notification.show {
            transform: translateX(0);
        }
        
        .completion-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(145deg, #6a11cb, #2575fc);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 1.2rem;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .completion-notification.show {
            transform: translateX(-50%) translateY(0);
        }
    `;
    document.head.appendChild(style);
});
