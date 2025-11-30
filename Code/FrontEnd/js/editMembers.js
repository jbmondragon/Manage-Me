document.addEventListener('DOMContentLoaded', async () => {
    const backBtn = document.getElementById('backBtn');
    const sectionSelect = document.getElementById('section');
    const messageEl = document.getElementById('message');
    const updateBtn = document.getElementById('addToDatabaseBtn');

    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/admin/home/members';
        });
    }

    // Get SID from URL and validate
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('sid');

    if (!sid || isNaN(sid)) {
        messageEl.textContent = "Invalid member SID specified.";
        messageEl.style.color = "red";
        return;
    }

    // Load sections into dropdown
    const loadSections = async () => {
        try {
            const res = await fetch('/api/sections');
            const data = await res.json();

            if (data.success) {
                sectionSelect.innerHTML = `<option value="">-- Select Section --</option>` +
                    data.sections
                        .map(s => `<option value="${s.section_id}">${s.section_name}</option>`)
                        .join('');
            } else {
                messageEl.innerText = 'Failed to load sections.';
                messageEl.style.color = 'red';
            }
        } catch (err) {
            console.error('Error fetching sections:', err);
            messageEl.innerText = 'Error fetching sections.';
            messageEl.style.color = 'red';
        }
    };

    await loadSections();

    // Load existing member info
    try {
        const res = await fetch(`/admin/home/members/get/${sid}`);
        const data = await res.json();

        if (data.success) {
            const member = data.member;

            document.getElementById('studentNumber').value = member.sid;
            document.getElementById('studentNumber').readOnly = true;

            document.getElementById('lastName').value = member.last_name;
            document.getElementById('firstName').value = member.first_name;
            document.getElementById('middleName').value = member.middle_name || '';
            document.getElementById('sex').value = member.sex;

            // Set selected section by ID
            sectionSelect.value = member.section_id || "";

            document.getElementById('email').value = member.email;
        } else {
            messageEl.textContent = "Member not found.";
            messageEl.style.color = "red";
        }
    } catch (err) {
        console.error('Error loading member:', err);
        messageEl.textContent = "Failed to load member data.";
        messageEl.style.color = "red";
    }

    // Update member
    updateBtn.addEventListener('click', async () => {
    const updatedMember = {
        lastName: document.getElementById('lastName').value.trim(),
        firstName: document.getElementById('firstName').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        sex: document.getElementById('sex').value.trim(),
        sectionID: sectionSelect.value,
        email: document.getElementById('email').value.trim()
    };

    // Validation
    const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
    const sexRegex = /^(Male|Female|Other)$/i;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!updatedMember.lastName || !updatedMember.firstName ||
        !updatedMember.sex || !updatedMember.sectionID || !updatedMember.email) {
        messageEl.textContent = "Please fill in all required fields.";
        messageEl.style.color = "red";
        return;
    }

    if (!nameRegex.test(updatedMember.lastName) || !nameRegex.test(updatedMember.firstName) ||
        (updatedMember.middleName && !nameRegex.test(updatedMember.middleName))) {
        messageEl.textContent = "Invalid name format.";
        messageEl.style.color = "red";
        return;
    }

    if (!sexRegex.test(updatedMember.sex)) {
        messageEl.textContent = "Invalid sex value.";
        messageEl.style.color = "red";
        return;
    }

    if (!emailRegex.test(updatedMember.email)) {
        messageEl.textContent = "Invalid email format.";
        messageEl.style.color = "red";
        return;
    }

    try {
        const res = await fetch(`/admin/home/members/alter/${sid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMember)
        });

        const result = await res.json();

        if (result.success) {
            // Show success message briefly
            messageEl.textContent = "Member updated successfully!";
            messageEl.style.color = "green";

            // Redirect back to member list after 1 second
            setTimeout(() => {
                window.location.href = '/admin/home/members';
            }, 1000);
        } else {
            messageEl.textContent = result.message;
            messageEl.style.color = "red";
        }
    } catch (err) {
        console.error('Error updating member:', err);
        messageEl.textContent = "Server error. Please try again.";
        messageEl.style.color = "red";
    }
    });

});
