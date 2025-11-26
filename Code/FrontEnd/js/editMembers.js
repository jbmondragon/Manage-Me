document.addEventListener('DOMContentLoaded', async () => {
    const backBtn = document.getElementById('backBtn');
    const updateBtn = document.getElementById('addToDatabaseBtn');
    const message = document.getElementById('message');

    backBtn.addEventListener('click', () => window.location.href = '/user/home');

    // Load current student info
const res = await fetch('/api/students/me', { credentials: "include" });
const result = await res.json();
if (result.success) {
    const data = result.data;
    document.getElementById('studentNumber').value = data.sid;
    document.getElementById('studentNumber').readOnly = true;
    document.getElementById('lastName').value = data.last_name;
    document.getElementById('firstName').value = data.first_name;
    document.getElementById('middleName').value = data.middle_name || '';
    document.getElementById('sex').value = data.sex;
    document.getElementById('section').value = data.section_name || '';
    document.getElementById('email').value = data.email;
}


    // Update info
    updateBtn.addEventListener('click', async () => {
        const studentData = {
            last_name: document.getElementById('lastName').value.trim(),
            first_name: document.getElementById('firstName').value.trim(),
            middle_name: document.getElementById('middleName').value.trim(),
            sex: document.getElementById('sex').value.trim(),
            section_name: document.getElementById('section').value.trim(),
            email: document.getElementById('email').value.trim()
        };

        if (!studentData.last_name || !studentData.first_name || !studentData.sex || !studentData.section_name || !studentData.email) {
            message.textContent = "Please fill in all required fields.";
            message.style.color = "red";
            return;
        }

        try {
            const updateRes = await fetch('/api/students/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify(studentData)
            });

            const updateResult = await updateRes.json();

            if (updateResult.success) {
                message.textContent = "Member updated successfully!";
                message.style.color = "green";
            } else {
                message.textContent = `Error: ${updateResult.message}`;
                message.style.color = "red";
            }
        } catch (err) {
            console.error(err);
            message.textContent = "Server error. Please try again later.";
            message.style.color = "red";
        }
    });
});
