document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('userLogoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('updateInfoBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/members/editMembers';
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('registerEventBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/user/login/registerEvent';
  });
});


