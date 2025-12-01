
/* Redirect to home page */
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('homeBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });
});

/* Redirect to view members page */
document.addEventListener('DOMContentLoaded', () => {
  const addMemberBtn = document.getElementById('addMemberBtn');
  if (!addMemberBtn) return;

  addMemberBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/members/addMembers';
  });
});

/* View Members Button */
document.addEventListener('DOMContentLoaded', () => {
  const viewMemberBtn = document.getElementById('viewMemberBtn');
  if (!viewMemberBtn) return;

  viewMemberBtn.addEventListener('click', () => {
    window.location.href = '/admin/home/members/viewMembers';
  });
});