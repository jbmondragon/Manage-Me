document.addEventListener('DOMContentLoaded', () => {
  // Admin Logout
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = '/admin';
    });
  }

  // Members page
  const membersBtn = document.getElementById('membersBtn');
  if (membersBtn) {
    membersBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/members';
    });
  }

  // Accountability page
  const accountabilityBtn = document.getElementById('accountabilityBtn');
  if (accountabilityBtn) {
    accountabilityBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability';
    });
  }

  // Sections page
  const sectionBtn = document.getElementById('sectionBtn');
  if (sectionBtn) {
    sectionBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/section';
    });
  }

  // Alumni Homecoming page
  const alumniHomecomingBtn = document.getElementById('alumniHomecomingBtn');
  if (alumniHomecomingBtn) {
    alumniHomecomingBtn.addEventListener('click', () => {
      window.location.href = '/admin/homecoming';
    });
  }

  // Analytics page
  const analyticsBtn = document.getElementById('analyticsBtn');
  if (analyticsBtn) {
    analyticsBtn.addEventListener('click', () => {
      window.location.href = '/admin/dashboard';
    });
  }

  // ---- Analytics Charts Rendering ----
  const membersSectionChartEl = document.getElementById('membersSectionChart');
  const genderChartEl = document.getElementById('genderChart');
  const eventTypeChartEl = document.getElementById('eventTypeChart');
  const eventAttendanceChartEl = document.getElementById('eventAttendanceChart');

  async function fetchData(endpoint) {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.success ? data.data : [];
  }

  // Render Members per Section
  if (membersSectionChartEl) {
    fetchData('/api/analytics/members/sections').then(data => {
      const ctx = membersSectionChartEl.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.section_name),
          datasets: [{
            label: 'Total Members',
            data: data.map(d => d.total_members),
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        },
        options: { responsive: true }
      });
    });
  }

  // Render Gender Distribution
  if (genderChartEl) {
    fetchData('/api/analytics/members/gender').then(data => {
      const ctx = genderChartEl.getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.sex),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
          }]
        },
        options: { responsive: true }
      });
    });
  }

  // Render Event Type Distribution
  if (eventTypeChartEl) {
    fetchData('/api/analytics/events/types').then(data => {
      const ctx = eventTypeChartEl.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(d => d.type),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          }]
        },
        options: { responsive: true }
      });
    });
  }

  // Render Event Registration vs Attendance
  if (eventAttendanceChartEl) {
    fetchData('/api/analytics/events/attendance').then(data => {
      const ctx = eventAttendanceChartEl.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.event_name),
          datasets: [
            { label: 'Registered', data: data.map(d => d.registered), backgroundColor: 'rgba(54, 162, 235, 0.6)' },
            { label: 'Attended', data: data.map(d => d.attended), backgroundColor: 'rgba(255, 99, 132, 0.6)' }
          ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    });
  }
});