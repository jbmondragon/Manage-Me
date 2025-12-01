/* Back Button */
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home';
    });
  }
});

/* Create Event Button */
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('createBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability/addEvent';
    });
  }
});

/* View Event Button */
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('viewBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability/viewEvent';
    });
  }
});