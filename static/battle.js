document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const userSprite = document.querySelector('.user-monster .monster-sprite');
    const pcSprite = document.querySelector('.pc-monster .monster-sprite');
    const userHealthBar = document.querySelector('.user-health');
    const pcHealthBar = document.querySelector('.pc-health');
    const userHpDisplay = document.getElementById('user-hp-current');
    const pcHpDisplay = document.getElementById('pc-hp-current');
    const moveButtons = document.querySelectorAll('.move-btn');
    const battleLog = document.getElementById('battle-log');
    
    // Music elements
    const battleMusic = document.getElementById('battle-music');
    const musicToggle = document.getElementById('music-toggle');
    let isMusicPlaying = true;
    
    // Initialize battle music
    function initBattleMusic() {
        // Start playing music with a slight delay to ensure DOM is ready
        setTimeout(() => {
            battleMusic.play()
                .then(() => {
                    console.log("Battle music started!");
                })
                .catch(error => {
                    console.error("Music playback failed:", error);
                    // Most browsers require user interaction before audio can play
                    addToBattleLog("Click the music button to start battle music!");
                });
        }, 500);
        
        // Set up music toggle
        musicToggle.addEventListener('click', function() {
            if (isMusicPlaying) {
                battleMusic.pause();
                musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                battleMusic.play();
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }
    
    // Set monster sprites
    // userSprite.style.backgroundImage = `url('/static/assets/monsters/${battleData.userMonster}')`;
    // pcSprite.style.backgroundImage = `url('/static/assets/monsters/${battleData.pcMonster}')`;
    
    // Set sprite styles for static images
    userSprite.style.backgroundSize = 'contain';
    pcSprite.style.backgroundSize = 'contain';
    userSprite.style.backgroundPosition = 'center';
    pcSprite.style.backgroundPosition = 'center';
    userSprite.style.backgroundRepeat = 'no-repeat';
    pcSprite.style.backgroundRepeat = 'no-repeat';
    
    // Determine if user goes first based on speed (unless modified by move priority)
    let userGoesFirst = battleData.userStats.Spe >= battleData.pcStats.Spe;
    
    // Track states for special moves
    let userProtectActive = false;
    let pcProtectActive = false;
    let userLastDamageTaken = 0;
    let pcLastDamageTaken = 0;
    
    // Calculate damage for different move types
    function calculateDamage(move, attacker, defender) {
        let damage = 0;
        let attackerStats = attacker === 'user' ? battleData.userStats : battleData.pcStats;
        let defenderStats = defender === 'user' ? battleData.userStats : battleData.pcStats;
        
        switch(move.id) {
            case 'slash':
                damage = Math.max(1, (attackerStats.atk * 5) - (defenderStats.def * 4));
                break;
                
            case 'hyperbeam':
                damage = Math.max(1, (attackerStats.spA * 5) - (defenderStats.spD * 4));
                break;
                
            case 'quickattack':
                damage = attackerStats.atk;
                break;
                
            case 'mudshot':
                damage = Math.max(1, ((attackerStats.atk * 5) - (defenderStats.def * 4)) * 0.8);
                // Speed reduction handled in applyMoveEffects
                break;
                
            case 'protect':
                damage = 0; // Damage application handled in applyMoveEffects
                break;
                
            case 'counter':
                damage = attacker === 'user' ? userLastDamageTaken * 2 : pcLastDamageTaken * 2;
                break;
                
            case 'drain':
                damage = Math.max(1, (((attackerStats.atk * 5) + (attackerStats.spA * 5) - 
                          (defenderStats.def * 4) - (defenderStats.spD * 4)) * 0.5));
                // Healing handled in applyMoveEffects
                break;
        }
        
        return Math.round(damage); // Round to nearest integer for cleaner display
    }
    
    // Apply special move effects
    function applyMoveEffects(move, attacker, defender, damage) {
        let attackerStats = attacker === 'user' ? battleData.userStats : battleData.pcStats;
        let defenderStats = defender === 'user' ? battleData.userStats : battleData.pcStats;
        let effectsApplied = [];
        
        switch(move.id) {
            case 'mudshot':
                // Reduce speed
                if (defender === 'user') {
                    battleData.userStats.Spe = Math.max(1, battleData.userStats.Spe - 0.5);
                    effectsApplied.push(`${attacker === 'user' ? 'Your' : 'Computer\'s'} Mud Shot lowered ${defender === 'user' ? 'your' : 'computer\'s'} speed!`);
                } else {
                    battleData.pcStats.Spe = Math.max(1, battleData.pcStats.Spe - 0.5);
                    effectsApplied.push(`${attacker === 'user' ? 'Your' : 'Computer\'s'} Mud Shot lowered ${defender === 'user' ? 'your' : 'computer\'s'} speed!`);
                }
                break;
                
            case 'protect':
                // 60% chance of protection
                if (Math.random() < 0.6) {
                    if (attacker === 'user') {
                        userProtectActive = true;
                        effectsApplied.push('You are protected from the next attack!');
                    } else {
                        pcProtectActive = true;
                        effectsApplied.push('Computer is protected from the next attack!');
                    }
                } else {
                    effectsApplied.push(`${attacker === 'user' ? 'Your' : 'Computer\'s'} Protect failed!`);
                }
                break;
                
            case 'drain':
                // Heal for half of damage dealt
                const healing = Math.round(damage * 0.5);
                if (attacker === 'user') {
                    battleData.userStats.HP = Math.min(battleData.userStats.maxHP, battleData.userStats.HP + healing);
                    userHpDisplay.textContent = battleData.userStats.HP;
                    userHealthBar.style.width = `${(battleData.userStats.HP / battleData.userStats.maxHP) * 100}%`;
                    effectsApplied.push(`You recovered ${healing} HP from Drain!`);
                } else {
                    battleData.pcStats.HP = Math.min(battleData.pcStats.maxHP, battleData.pcStats.HP + healing);
                    pcHpDisplay.textContent = battleData.pcStats.HP;
                    pcHealthBar.style.width = `${(battleData.pcStats.HP / battleData.pcStats.maxHP) * 100}%`;
                    effectsApplied.push(`Computer recovered ${healing} HP from Drain!`);
                }
                break;
        }
        
        return effectsApplied;
    }
    
    // Apply damage function with protect consideration
    function applyDamage(target, damage, move) {
        // Check for protect
        if (target === 'user' && userProtectActive) {
            userProtectActive = false;
            addToBattleLog('Your Protect blocked the attack!');
            addToBattleLog(`You counter-attacked for ${battleData.pcStats.atk} damage!`);
            applyDamage('pc', battleData.pcStats.atk, {id: 'protect_counter'});
            return 0;
        } else if (target === 'pc' && pcProtectActive) {
            pcProtectActive = false;
            addToBattleLog('Computer\'s Protect blocked the attack!');
            addToBattleLog(`Computer counter-attacked for ${battleData.userStats.atk} damage!`);
            applyDamage('user', battleData.userStats.atk, {id: 'protect_counter'});
            return 0;
        }
        
        // Store damage for counter
        if (target === 'user') {
            userLastDamageTaken = damage;
            
            battleData.userStats.HP = Math.max(0, battleData.userStats.HP - damage);
            const hpPercent = (battleData.userStats.HP / battleData.userStats.maxHP) * 100;
            userHealthBar.style.width = `${hpPercent}%`;
            userHpDisplay.textContent = battleData.userStats.HP;
            
            // Check if user is defeated
            if (battleData.userStats.HP <= 0) {
                gameOver(false);
            }
        } else {
            pcLastDamageTaken = damage;
            
            battleData.pcStats.HP = Math.max(0, battleData.pcStats.HP - damage);
            const hpPercent = (battleData.pcStats.HP / battleData.pcStats.maxHP) * 100;
            pcHealthBar.style.width = `${hpPercent}%`;
            pcHpDisplay.textContent = battleData.pcStats.HP;
            
            // Check if PC is defeated
            if (battleData.pcStats.HP <= 0) {
                gameOver(true);
            }
        }
        return damage;
    }
    
    // Execute an attack with a specific move
    function executeMove(attacker, move) {
        const defender = attacker === 'user' ? 'pc' : 'user';
        const attackerName = attacker === 'user' ? 'Your monster' : 'Computer\'s monster';
        
        addToBattleLog(`${attackerName} used ${move.name}!`);
        
        // Calculate damage
        const damage = calculateDamage(move, attacker, defender);
        
        // Apply damage unless it's protect move
        if (move.id !== 'protect') {
            const actualDamage = applyDamage(defender, damage, move);
            if (actualDamage > 0) {
                addToBattleLog(`${move.name} dealt ${actualDamage} damage!`);
            }
        }
        
        // Apply special effects
        const effects = applyMoveEffects(move, attacker, defender, damage);
        effects.forEach(effect => addToBattleLog(effect));
        
        return new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    // Game over function
    function gameOver(userWins) {
        battleData.isGameOver = true;
        
        // Fade out battle music
        if (battleMusic) {
            const fadeAudio = setInterval(() => {
                if (battleMusic.volume > 0.1) {
                    battleMusic.volume -= 0.1;
                } else {
                    battleMusic.pause();
                    clearInterval(fadeAudio);
                }
            }, 200);
        }
        
        // Disable buttons
        moveButtons.forEach(btn => btn.disabled = true);
        
        if (userWins) {
            addToBattleLog('Congratulations! You won the battle!');
        } else {
            addToBattleLog('You lost the battle. Better luck next time!');
        }
        
        // Add return button
        setTimeout(() => {
            addToBattleLog('Returning to main menu in 5 seconds...');
            setTimeout(() => {
                window.location.href = '/';
            }, 5000);
        }, 1000);
    }
    
    // Add message to battle log
    function addToBattleLog(message) {
        const p = document.createElement('p');
        p.textContent = message;
        battleLog.appendChild(p);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    // Computer selects a move
    function computerSelectMove() {
        return battleData.pcMoves[Math.floor(Math.random() * battleData.pcMoves.length)];
    }
    
    // Execute a full turn with both user and computer moves
    async function executeTurn(userMove) {
        // Disable all move buttons during turn execution
        moveButtons.forEach(btn => btn.disabled = true);
        
        const pcMove = computerSelectMove();
        
        addToBattleLog(`----- New Turn -----`);
        addToBattleLog(`You selected ${userMove.name}`);
        addToBattleLog(`Computer selected ${pcMove.name}`);
        
        // Determine move order based on priority and speed
        let userFirst = false;

        if (userMove.id === 'quickattack' && pcMove.id !== 'quickattack') {
            userFirst = true;
        } else if (pcMove.id === 'quickattack' && userMove.id !== 'quickattack') {
            userFirst = false;
        } else if (userMove.priority > pcMove.priority) {
            userFirst = true;
        } else if (pcMove.priority > userMove.priority) {
            userFirst = false;
        } else {
            userFirst = battleData.userStats.Spe >= battleData.pcStats.Spe;
        }
        
        if (userFirst) {
            addToBattleLog(`Your monster moves first!`);
            await executeMove('user', userMove);
            
            // Only execute PC move if the game isn't over
            if (!battleData.isGameOver) {
                await executeMove('pc', pcMove);
            }
        } else {
            addToBattleLog(`Computer's monster moves first!`);
            await executeMove('pc', pcMove);
            
            // Only execute user move if the game isn't over
            if (!battleData.isGameOver) {
                await executeMove('user', userMove);
            }
        }
        
        // Reset protection status at end of turn
        userProtectActive = false;
        pcProtectActive = false;
        
        // Re-enable move buttons if game isn't over
        if (!battleData.isGameOver) {
            moveButtons.forEach(btn => btn.disabled = false);
        }
    }
    
    // Set up move button event listeners
    moveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moveId = this.dataset.move;
            const selectedMove = battleData.userMoves.find(move => move.id === moveId);
            
            if (selectedMove) {
                executeTurn(selectedMove);
            }
        });
    });
    
    // Initialize music
    initBattleMusic();
    
    // Start battle log
    addToBattleLog('Battle started! Choose your move...');
    addToBattleLog(`${userGoesFirst ? 'Your' : 'Computer\'s'} monster has higher speed and would normally move first.`);
    addToBattleLog(`Your available moves: ${battleData.userMoves.map(m => m.name).join(', ')}`);
});