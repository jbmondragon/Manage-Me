// superMain.js

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.top-bar button');

  function clearActive() {
    buttons.forEach(btn => btn.classList.remove('active'));
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      clearActive();
      button.classList.add('active');

      /* Navigation based on button ID */
      if (button.id === 'dashboard') {
        window.location.href = '/admin/home';
      } else if (button.id === 'about') {
        window.location.href = '/about';
      } else if (button.id === 'log-in') {
        window.location.href = '/admin/loginPage';
      }
    });
  });
});
