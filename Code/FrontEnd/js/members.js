document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('homeBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });
});