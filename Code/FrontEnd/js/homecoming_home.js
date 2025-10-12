document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('createBtn');
  if (!createBtn) return;

  createBtn.addEventListener('click', () => {
    window.location.href = '/admin/homecoming/addHomecoming';
  });
});