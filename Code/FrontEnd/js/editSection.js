document.addEventListener("DOMContentLoaded", async () => {
  const backBtn = document.getElementById("backBtn");
  const saveBtn = document.getElementById("saveBtn");

  /* Get section ID from URL */
  const urlParams = new URLSearchParams(window.location.search);
  const sectionId = urlParams.get("id");

  if (!sectionId) {
    alert("Missing section ID.");
    window.location.href = "/admin/home/section";
    return;
  }

  /* Load existing section details */
  const loadSection = async () => {
    try {
      const res = await fetch(`/api/sections/${sectionId}`);
      const result = await res.json();

      if (!result.success) {
        alert("Error loading section.");
        return;
      }

      const section = result.section;

      document.getElementById("sectionName").value = section.section_name;
      document.getElementById("gradeLevel").value = section.grade_level;
      document.getElementById("academicYear").value = section.academic_year;
      document.getElementById("adviser").value = section.adviser;

    } catch (error) {
      console.error(error);
      alert("Failed to fetch section details.");
    }
  };

  loadSection();

  /* Save button */
  saveBtn.addEventListener("click", async () => {
    const updatedData = {
      section_name: document.getElementById("sectionName").value.trim(),
      grade_level: document.getElementById("gradeLevel").value,
      academic_year: document.getElementById("academicYear").value,
      adviser: document.getElementById("adviser").value.trim()
    };

    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      const result = await res.json();

      if (result.success) {
        alert("Section updated successfully!");
        window.location.href = "/admin/home/section";
      } else {
        alert("Error: " + result.message);
      }

    } catch (error) {
      console.error(error);
      alert("Failed to update section.");
    }
  });

  /* Back button */
  backBtn.addEventListener("click", () => {
    window.location.href = "/admin/home/section";
  });
});
