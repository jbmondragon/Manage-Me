document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const membersBtn = document.getElementById('membersBtn');
  if (!membersBtn) return;

  membersBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/members';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const accountabilityBtn = document.getElementById('accountabilityBtn');
  if (!accountabilityBtn) return;

  accountabilityBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });
});




document.addEventListener('DOMContentLoaded', () => {
  const alumniHomecomingBtn = document.getElementById('alumniHomecomingBtn');
  if (!alumniHomecomingBtn) return;

  alumniHomecomingBtn.addEventListener('click', () => {
    window.location.href = '/admin/homecoming';
  });
});

