document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('userLogoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/';
  });
});
