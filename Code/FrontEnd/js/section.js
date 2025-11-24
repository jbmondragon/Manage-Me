document.addEventListener('DOMContentLoaded', () => {
  // Home button navigation
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.href = '/admin/home';
    });
  }

  // Add Section button navigation
  const addSectionBtn = document.getElementById('addSectionBtn');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/section/addSection';
    });
  }

  // View Section button navigation
  const viewSectionBtn = document.getElementById('viewSectionBtn');
  if (viewSectionBtn) {
    viewSectionBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/section/viewSection';
    });
  }
});
