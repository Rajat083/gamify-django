document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const levelUpBtn = document.getElementById('level-up-btn');
    const activityButtonsContainer = document.getElementById('activity-buttons');
    const returnBtn = document.getElementById('return-btn');
    
    // Radar chart initialization
    const ctx = document.getElementById('statsChart').getContext('2d');
    const statsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'],
            datasets: [{
                label: 'Character Stats',
                data: [
                    parseInt(document.getElementById('hp-value').textContent), 
                    parseInt(document.getElementById('atk-value').textContent), 
                    parseInt(document.getElementById('def-value').textContent), 
                    parseInt(document.getElementById('spa-value').textContent), 
                    parseInt(document.getElementById('spd-value').textContent), 
                    parseInt(document.getElementById('spe-value').textContent)
                ],
                backgroundColor: 'rgba(255, 165, 0, 0.2)',
                borderColor: 'orange',
                pointBackgroundColor: 'orange',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'orange'
            }]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 20
                }
            }
        }
    });
    
    // Toggle function for activity buttons
    function toggleActivityButtons() {
        if (activityButtonsContainer.classList.contains('visible')) {
            // Hide activity buttons
            activityButtonsContainer.classList.remove('visible');
            
            // Show level up button with delay
            setTimeout(() => {
                levelUpBtn.classList.remove('collapsed');
            }, 300);
        } else {
            // Hide level up button
            levelUpBtn.classList.add('collapsed');
            
            // Show activity buttons with delay
            setTimeout(() => {
                activityButtonsContainer.classList.add('visible');
            }, 300);
        }
    }
    
    // Event listeners
    levelUpBtn.addEventListener('click', toggleActivityButtons);
    returnBtn.addEventListener('click', toggleActivityButtons);
    
    // GitHub button click handler
    document.getElementById('github-btn').addEventListener('click', function(e) {
        // Prevent default behavior
        e.preventDefault();
        
        // Log to console for debugging
        console.log('GitHub button clicked, redirecting...');
        
        // Navigate to the GitHub page
        window.location.href = '/github';
    });
    
    // LeetCode button click handler
    document.getElementById('leetcode-btn').addEventListener('click', function(e) {
        // Prevent default behavior
        e.preventDefault();
        
        // Log to console for debugging
        console.log('LeetCode button clicked, redirecting...');
        
        // Navigate to the LeetCode page
        window.location.href = '/leetcode';
    });
    
    // Fix the Pomodoro button event handler
    document.getElementById('pomodoro-btn').addEventListener('click', function(e) {
        // Prevent default behavior (if any)
        e.preventDefault();
        
        // Log to console for debugging
        console.log('Pomodoro button clicked, redirecting...');
        
        // Directly set window location instead of using href property
        window.location.href = '/pomodoro';
    });
    
    // Ensure all button click handlers are working
    
    // LeetCode button click handler (already exists)
    
    // Pomodoro button click handler (already exists)
    
    // Fix potential issues with the chart initialization
    try {
        // Get stat values from the DOM
        const hpValue = parseInt(document.getElementById('hp-value').textContent) || 20;
        const atkValue = parseInt(document.getElementById('atk-value').textContent) || 5;
        const defValue = parseInt(document.getElementById('def-value').textContent) || 5;
        const spaValue = parseInt(document.getElementById('spa-value').textContent) || 5;
        const spdValue = parseInt(document.getElementById('spd-value').textContent) || 5;
        const speValue = parseInt(document.getElementById('spe-value').textContent) || 5;
        
        // Refresh the chart data
        statsChart.data.datasets[0].data = [
            hpValue,
            atkValue,
            defValue,
            spaValue,
            spdValue,
            speValue
        ];
        
        statsChart.update();
    } catch (error) {
        console.error("Error initializing or updating chart:", error);
    }
});
