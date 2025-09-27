document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin';
  });
});
