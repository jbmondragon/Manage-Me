
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.top-bar button');

  function clearActive() {
    buttons.forEach(btn => btn.classList.remove('active'));
  }

  clearActive();
  document.getElementById('about').classList.add('active');

  /* Navigation based on button ID */
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      clearActive();
      button.classList.add('active');

      /* Redirect to Home Page */
      if (button.id === 'dashboard') {
        window.location.href = '/';
        /* Redirect to login page */
      } else if (button.id === 'log-in') {
        window.location.href = '/admin/loginPage';
      }
    });
  });
});
