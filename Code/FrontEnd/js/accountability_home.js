document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home';
    });
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('createBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability/addEvent';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('viewBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability/viewEvent';
    });
  }
});