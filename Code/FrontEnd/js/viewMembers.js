document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  const membersList = document.querySelector('.members-list');
  const filterSelect = document.getElementById('filterSelect');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });

  try {
    /* Fetch members from API */
    const response = await fetch('/admin/home/members/list');
    const data = await response.json();

    /* Handle API errors */
    if (!data.success) {
      membersList.innerHTML = `<div class="error">${data.message}</div>`;
      return;
    }

    const members = data.members;

    /* Extract unique sections for filter */
    const sections = [...new Set(members.map(m => m.section_name || m.section).filter(Boolean))];

    /* Populate filter dropdown */
    filterSelect.innerHTML = `<option value="all">All sections</option>`;
    sections.forEach(section => {
      const option = document.createElement('option');
      option.value = section;
      option.textContent = section;
      filterSelect.appendChild(option);
    });

    /* Function to render members based on filter and search */
    const renderMembers = (filter = 'all', search = '') => {
      membersList.innerHTML = '';
      const filtered = members.filter(member => {
        const memberSection = member.section_name || member.section || '';
        const inSection = filter === 'all' || memberSection === filter;
        const searchLower = search.toLowerCase();
        const inSearch = !search || member.sid.includes(search) || member.first_name.toLowerCase().includes(searchLower) || member.last_name.toLowerCase().includes(searchLower);
        return inSection && inSearch;
      });

      if (filtered.length === 0) {
        membersList.innerHTML = `<div class="no-results">No members found.</div>`;
        return;
      }

      /* Render each member */
      filtered.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member');

        const memberSection = member.section_name || member.section || 'No section';
        memberDiv.innerHTML = `
          <span>${member.sid} - ${member.last_name}, ${member.first_name} ${member.middle_name || ''} <small>(${memberSection})</small></span>
          <div class="actions">
            <button class="edit">edit</button>
            <button class="delete">delete</button>
          </div>
        `;

        /* Append member to the list */
        membersList.appendChild(memberDiv);

        /* Delete member functionality */
        memberDiv.querySelector('.delete')?.addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
            try {
              const delResponse = await fetch(`/admin/home/members/delete/${member.sid}`, { method: 'DELETE' });
              const delData = await delResponse.json();
              if (delData.success) {
                alert('Member deleted successfully');
                memberDiv.remove();
              } else {
                alert(delData.message);
              }
            } catch (err) {
              console.error('Error deleting member:', err);
              alert('Failed to delete member');
            }
          }
        });

        /* Edit member functionality */
        memberDiv.querySelector('.edit')?.addEventListener('click', () => {
          window.location.href = `/admin/home/members/editMembers?sid=${member.sid}`;
        });
      });
    };

    renderMembers();

    filterSelect.addEventListener('change', () => renderMembers(filterSelect.value, searchInput.value.trim()));
    searchBtn?.addEventListener('click', e => { e.preventDefault(); renderMembers(filterSelect.value, searchInput.value.trim()); });
    searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); searchBtn.click(); } });

  } catch (err) {
    console.error('Error fetching members:', err);
    membersList.innerHTML = `<div class="error">Failed to load members</div>`;
  }
});