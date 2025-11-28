// /js/viewSection.js

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const membersList = document.querySelector('.members-list');

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/section';
    });
  }

  // Fetch and display sections
  const fetchSections = async (query = '') => {
    try {
      const url = query ? `/api/sections?search=${encodeURIComponent(query)}` : '/api/sections';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (!result.success) {
        membersList.innerHTML = `<p style="color:red;">Error: ${result.message}</p>`;
        return;
      }

      if (!result.sections || result.sections.length === 0) {
        membersList.innerHTML = '<p>No sections found.</p>';
        return;
      }

      // Render sections
      membersList.innerHTML = result.sections.map(section => `
        <div class="section-item" data-section-id="${section.section_id}">
          <div class="section-info">
            <h3 class="section-name" style="color:black; cursor:default;">
              ${section.section_name}
            </h3>
            <p>Grade Level: ${section.grade_level || 'N/A'}</p>
            <p>Academic Year: ${section.academic_year || 'N/A'}</p>
            <p>Adviser: ${section.adviser || 'N/A'}</p>
          </div>
          <div class="section-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
        </div>
      `).join('');

      // Attach Edit and Delete handlers
      membersList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sectionDiv = btn.closest('.section-item');
          const sectionId = sectionDiv.getAttribute('data-section-id');
          window.location.href = `/admin/home/section/editSection?id=${sectionId}`;
        });
      });

      membersList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const sectionDiv = btn.closest('.section-item');
          const sectionId = sectionDiv.getAttribute('data-section-id');
          if (confirm('Are you sure you want to delete this section?')) {
            try {
              const res = await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
              const data = await res.json();
              if (data.success) {
                alert('Section deleted successfully.');
                fetchSections(searchInput.value.trim());
              } else {
                alert(`Error: ${data.message}`);
              }
            } catch (err) {
              console.error(err);
              alert('Failed to delete section.');
            }
          }
        });
      });

    } catch (err) {
      console.error(err);
      membersList.innerHTML = '<p style="color:red;">Failed to fetch sections.</p>';
    }
  };

  // Initial load
  fetchSections();

  // Search functionality
  const handleSearch = () => {
    const query = searchInput.value.trim();
    fetchSections(query);
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSearch();
  });
});
