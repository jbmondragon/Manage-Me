document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createEventBtn");
  const backBtn = document.getElementById('backBtn');

  /* Back Button */
  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });

  /* Create Event Button */
  createBtn?.addEventListener("click", async () => {
    const nameOfEvent = document.getElementById("eventName").value.trim();
    const eventType = document.getElementById("eventType").value;
    const theme = document.getElementById("theme").value.trim();
    const location = document.getElementById("location").value.trim();
    const startDate = document.getElementById("startDate").value;
    const time = document.getElementById("time").value;
    const endDate = document.getElementById("endDate").value;
    const duration = document.getElementById("duration").value;
    const amount = document.getElementById("fee").value || 0;
    const dueDate = document.getElementById("dueDate").value;
    const paymentInstructions = document
      .getElementById("paymentInstructions")
      .value.trim();

    /* Basic validation */
    if (!nameOfEvent || !startDate) {
      alert("Please fill in the Event Name and Start Date.");
      return;
    }

    /* Send POST request to add event */
    try {
      const res = await fetch("/admin/home/events/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameOfEvent,
          eventType,
          theme,
          location,
          startDate,
          time,
          endDate,
          duration,
          amount,
          dueDate,
          paymentInstructions
        })
      });

      const data = await res.json();

      /* Handle response */
      if (data.success) {
        alert("Event created successfully!");
        document.querySelectorAll("input, textarea").forEach((el) => (el.value = ""));
      } else {
        alert(`${data.message}`);
      }

    /* Catch errors */
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Server error while creating event.");
    }
  });
});
