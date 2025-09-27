document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginBtn');

  loginBtn.addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Optional: log inputs
    console.log("Username:", username);
    console.log("Password:", password);

    try {
      // Send login request to server
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      // Show message returned from server
      document.getElementById('message').innerText = data.message;

    } catch (err) {
      console.error('Error connecting to server:', err);
      document.getElementById('message').innerText = 'Error connecting to server';
    }
  });
});

// homepage_script.js
document.addEventListener('DOMContentLoaded', function() {
  const adminBtn = document.getElementById('adminLoginBtn');

  adminBtn.addEventListener('click', function() {
    // Redirect to admin login page
    window.location.href = '/admin';
  });
});


console.log("admin_script.js loaded");
