document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#login-form');
    const signupForm = document.querySelector('#signup-form');
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const loginError = document.querySelector('#login-error');
    const signupError = document.querySelector('#signup-error');

    // Toggle between login and signup forms
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            document.querySelector('.login-form').classList.toggle('slide-left');
            document.querySelector('.signup-form').classList.toggle('slide-right');
            
            // Clear any error messages when switching forms
            loginError.textContent = '';
            signupError.textContent = '';
        });
    });
});