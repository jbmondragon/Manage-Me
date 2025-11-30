document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginBtn = document.getElementById('loginBtn');
    const resetBtn = document.getElementById('resetBtn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    const usernameField = document.getElementById('username');
    const message = document.getElementById('message');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // NEW

    // Top bar buttons
    const aboutBtn = document.getElementById('about');
    const userLoginBtn = document.getElementById('userLoginBtn');
    const homeBtn = document.getElementById('homeBtn');

    // ----- LOGIN -----
    loginBtn.addEventListener('click', async function() {
        const username = usernameField.value.trim();
        const password = passwordField.value.trim();

        if (!username || !password) {
            message.textContent = "Please fill in both fields.";
            return;
        }

        message.textContent = "Logging in...";

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '/admin/home';
            } else {
                message.textContent = data.message || "Invalid username or password.";
            }
        } catch (err) {
            console.error('Error connecting to server:', err);
            message.textContent = 'Error connecting to server.';
        }
    });

    // ----- RESET -----
    resetBtn?.addEventListener('click', function() {
        usernameField.value = '';
        passwordField.value = '';
        message.textContent = '';
    });

    // ----- TOGGLE PASSWORD VISIBILITY -----
    togglePassword?.addEventListener('click', function() {
        const isHidden = passwordField.type === 'password';
        passwordField.type = isHidden ? 'text' : 'password';
        togglePassword.textContent = isHidden ? '🙈' : '👁️';
    });

    // ----- NAVIGATION -----
    aboutBtn?.addEventListener('click', () => window.location.href = '/about');
    userLoginBtn?.addEventListener('click', () => window.location.href = '/user/login');
    homeBtn?.addEventListener('click', () => window.location.href = '/admin');

    // ----- FORGOT PASSWORD -----
    forgotPasswordLink?.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
        alert("Feature under maintenance.");
        window.location.href = '/admin/loginPage';
    });
});
