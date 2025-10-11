document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('membersBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/members';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('accountabilityBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });
});

