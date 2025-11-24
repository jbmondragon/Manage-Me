document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  const proofFile = document.getElementById('proofFile');
  const submitProofBtn = document.getElementById('submitProofBtn');
  const proofStatus = document.getElementById('proofStatus');
  const paymentStatus = document.getElementById('paymentStatus');
  const submissionStatus = document.getElementById('submissionStatus');

  const eventId = new URLSearchParams(window.location.search).get('eid');

  // Go back
  backBtn?.addEventListener('click', () => {
    window.location.href = '/';
  });

  // Load event details
  async function loadEventDetails() {
    try {
      const res = await fetch(`/member/events/${eventId}`);
      const data = await res.json();
      if (data.success) {
        document.getElementById('eventName').textContent = data.event.event_name;
        document.getElementById('eventDate').textContent = `Date: ${new Date(data.event.start_date).toLocaleDateString()} - ${new Date(data.event.end_date).toLocaleDateString()}`;
        document.getElementById('eventVenue').textContent = `Venue: ${data.event.venue || 'TBD'}`;
        document.getElementById('eventAmount').textContent = `Amount: ₱${Number(data.event.amount).toFixed(2)}`;
        updateStatus(data.event.submission || {});
      }
    } catch (err) {
      console.error('Error loading event details', err);
    }
  }

  // Update submission/payment status
  function updateStatus(submission) {
    if (submission.proof_submitted) {
      proofStatus.textContent = 'Proof of payment submitted.';
      submissionStatus.textContent = `Status: ${submission.verified ? 'Verified' : 'Pending Verification'}`;
      paymentStatus.textContent = `Payment status: ${submission.paid ? 'Paid' : 'Pending'}`;
    } else {
      proofStatus.textContent = 'You have not submitted proof of payment yet.';
      submissionStatus.textContent = 'Status: Not submitted';
      paymentStatus.textContent = 'Payment status: Pending';
    }
  }

  // Submit proof of payment
  submitProofBtn?.addEventListener('click', async () => {
    if (!proofFile.files.length) return alert('Please select a file to upload.');

    const formData = new FormData();
    formData.append('proof', proofFile.files[0]);

    try {
      const res = await fetch(`/member/events/${eventId}/submitProof`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Proof submitted successfully!');
        updateStatus({ proof_submitted: true, verified: false, paid: false });
      } else {
        alert(data.message || 'Failed to submit proof.');
      }
    } catch (err) {
      console.error('Error submitting proof', err);
      alert('Error submitting proof.');
    }
  });

  loadEventDetails();
});
