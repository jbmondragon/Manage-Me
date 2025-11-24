// Fetch single event for editing
app.get('/api/events/:eid/details', async (req, res) => {
  const { eid } = req.params;

  if (!eid) return res.status(400).json({ success: false, message: 'Event ID is required.' });

  try {
    const result = await pool.query('SELECT * FROM events WHERE eid=$1', [eid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ success: false, message: 'Server error fetching event.' });
  }
});