require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const os = require('os');
const ngrok = require('ngrok');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from FrontEnd folder
app.use(express.static(path.join(__dirname, 'FrontEnd')));

// PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});



// Route for Admin Log-in Page (SID1)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'admin_login.html'));
});

/***************************Login admin route*****************************************/
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Example: if you store admins in a separate table
    const result = await pool.query(
      'SELECT * FROM admin WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Ka cute ni Jake!' });
    } else {
      res.json({ success: false, message: 'Invalid admin credentials.' });
    }
  } catch (err) {
    console.error('Database error (admin login):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route for User Log-in Page (SID3)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'app_user_login.html'));
});

/***************************Login app_user route*****************************************/
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM app_user WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Ka cute ni Jake!' });
    } else {
      res.json({ success: false, message: 'Invalid username or password.' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route for User Home Page
app.get('/user/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'user_home.html'));
});

// Route for Admin Home Page
app.get('/admin/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'admin_home.html'));
});

// Route for Admin Member Page
app.get('/admin/home/members', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'members.html'));
});

// Route for Admin Add Member Page
app.get('/admin/home/members/addMembers', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'addMembers.html'));
});

// Route for Admin View Member Page
app.get('/admin/home/members/viewMembers', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'viewMembers.html'));
});

/***************************Route for add member*****************************************/
app.post('/admin/home/members/add', async (req, res) => {
  const { studentNumber, lastName, firstName, middleName, sex, section, email } = req.body;

  // Regex validation
  const studentNumberRegex = /^[0-9]{12}$/;
  const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
  const sexRegex = /^(Male|Female|Other)$/i;
  const sectionRegex = /^[A-Za-z0-9]{1,10}$/; // allow lowercase and uppercase
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !studentNumberRegex.test(studentNumber) ||
    !nameRegex.test(lastName) ||
    !nameRegex.test(firstName) ||
    (middleName && !nameRegex.test(middleName)) ||
    !sexRegex.test(sex) ||
    !sectionRegex.test(section) ||
    !emailRegex.test(email)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    // Check for existing student number
    const existing = await pool.query('SELECT * FROM students WHERE sid = $1', [studentNumber]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Student number already exists.' });
    }

    // Insert member
    await pool.query(
      `INSERT INTO students (sid, last_name, first_name, middle_name, sex, section, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [studentNumber, lastName, firstName, middleName || '', sex, section, email]
    );

    res.json({ success: true, message: 'Member added successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to add member.' });
  }
});

/***************************View All member*****************************************/
app.get('/admin/home/members/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY last_name, first_name');
    res.json({ success: true, members: result.rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});


/***************************Delete member by sid*****************************************/
app.delete('/admin/home/members/delete/:sid', async (req, res) => {
  const { sid } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE sid = $1', [sid]);
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to delete member' });
  }
});

// Route for Admin Edit Member Page
app.get('/admin/home/members/editMembers', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'editMembers.html'));
});

/***************************Route for alter (update) member information*****************************************/
app.post('/admin/home/members/alter', async (req, res) => {
  const { studentNumber, lastName, firstName, middleName, sex, section, email } = req.body;

  // Regex validation
  const studentNumberRegex = /^[0-9]{12}$/;
  const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
  const sexRegex = /^(Male|Female|Other)$/i;
  const sectionRegex = /^[A-Za-z0-9]{1,10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !studentNumberRegex.test(studentNumber) ||
    !nameRegex.test(lastName) ||
    !nameRegex.test(firstName) ||
    (middleName && !nameRegex.test(middleName)) ||
    !sexRegex.test(sex) ||
    !sectionRegex.test(section) ||
    !emailRegex.test(email)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    // Check if student exists
    const existing = await pool.query('SELECT * FROM students WHERE sid = $1', [studentNumber]);
    if (existing.rows.length === 0) {
      return res.json({ success: false, message: 'Student number not found.' });
    }

    // Update member information
    await pool.query(
      `UPDATE students
       SET last_name = $2,
           first_name = $3,
           middle_name = $4,
           sex = $5,
           section = $6,
           email = $7
       WHERE sid = $1`,
      [studentNumber, lastName, firstName, middleName || '', sex, section, email]
    );

    res.json({ success: true, message: 'Member information updated successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to update member information.' });
  }
});

/***************************Route for get member by ID*****************************************/
app.get('/admin/home/members/get/:sid', async (req, res) => {
  const { sid } = req.params;
  try {
    const result = await pool.query('SELECT * FROM students WHERE sid = $1', [sid]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Member not found.' });
    }
    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to retrieve member.' });
  }
});


// Route for Admin Accountability Page
app.get('/admin/home/accountability', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'accountability_home.html'));
});

// Route for Admin Add Event Page
app.get('/admin/home/accountability/addEvent', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'addEvent.html'));
});

/***************************Add Event*****************************************/
app.post('/admin/home/events/add', async (req, res) => {
  const { nameOfEvent, startDate, endDate, amount } = req.body;

  const nameRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,100}$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const amountRegex = /^\d+(\.\d{1,2})?$/;

  if (
    !nameRegex.test(nameOfEvent) ||
    !dateRegex.test(startDate) ||
    !dateRegex.test(endDate) ||
    !amountRegex.test(amount)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    // Check if event name already exists
    const existing = await pool.query('SELECT * FROM events WHERE event_name = $1', [nameOfEvent]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Event already exists.' });
    }

    // Insert event into database
    await pool.query(
      `INSERT INTO events (event_name, start_date, end_date, amount)
       VALUES ($1, $2, $3, $4)`,
      [nameOfEvent, startDate, endDate, amount]
    );

    res.json({ success: true, message: 'Event added successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to add event.' });
  }
});

// Route for Admin View Event Page
app.get('/admin/home/accountability/viewEvent', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'viewEvent.html'));
});

/*************************** View All Events *****************************************/
app.get('/admin/home/events/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * 
      FROM events 
      ORDER BY start_date ASC, end_date ASC;
    `);

    res.json({ success: true, events: result.rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

/***************************Delete Event by eid*****************************************/
app.delete('/admin/home/events/delete/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    await pool.query('DELETE FROM events WHERE eid = $1', [eid]);
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to delete event' });
  }
});

// Route for Admin Edit Event Page
app.get('/admin/home/event/editMembers', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'editEvent.html'));
});

/*************************** Route for alter (update) event information *****************************************/
app.post('/admin/home/events/alter', async (req, res) => {
  const { eventId, nameOfEvent, startDate, endDate, amount } = req.body;

  // Regex validation
  const eventIdRegex = /^[0-9]+$/;
  const nameRegex = /^[a-zA-Z0-9\s.,!?()\-]{1,100}$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // yyyy-mm-dd
  const amountRegex = /^\d+(\.\d{1,2})?$/; // e.g. 1000 or 99.99

  if (
    !eventIdRegex.test(eventId) ||
    !nameRegex.test(nameOfEvent) ||
    !dateRegex.test(startDate) ||
    !dateRegex.test(endDate) ||
    !amountRegex.test(amount)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    // Check if event exists
    const existing = await pool.query('SELECT * FROM events WHERE eid = $1', [eventId]);
    if (existing.rows.length === 0) {
      return res.json({ success: false, message: 'Event not found.' });
    }

    // Update event information
    await pool.query(
      `UPDATE events
       SET event_name = $2,
           start_date = $3,
           end_date = $4,
           amount = $5
       WHERE eid = $1`,
      [eventId, nameOfEvent, startDate, endDate, amount]
    );

    res.json({ success: true, message: 'Event information updated successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to update event information.' });
  }
});

/*************************** Route for get event by ID *****************************************/
app.get('/admin/home/events/get/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const result = await pool.query('SELECT * FROM events WHERE eid = $1', [eid]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to retrieve event.' });
  }
});


// Route for Admin Homecoming Page
app.get('/admin/homecoming', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'homecoming_home.html'));
});



// Route for Admin Homecoming Page
app.get('/admin/homecoming/addHomecoming', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'addHomecoming.html'));
});


/*************************** Add Homecoming Event *****************************************/
app.post('/admin/home/homecoming/add', async (req, res) => {
  const { eventName, theme, dateTime, venue } = req.body;

  // Validation regex patterns
  const nameRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,100}$/;  // letters, digits, punctuation
  const themeRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,150}$/;
  const venueRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,150}$/;
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // datetime-local format

  // Validate all inputs
  if (
    !nameRegex.test(eventName) ||
    !themeRegex.test(theme) ||
    !venueRegex.test(venue) ||
    !dateTimeRegex.test(dateTime)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    // Check if homecoming event already exists
    const existing = await pool.query('SELECT * FROM homecoming WHERE event_name = $1', [eventName]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Homecoming event already exists.' });
    }

    // Insert new homecoming event
    await pool.query(
      `INSERT INTO homecoming (event_name, theme, date_time, venue)
       VALUES ($1, $2, $3, $4)`,
      [eventName, theme, dateTime.replace('T', ' '), venue]
    );

    res.json({ success: true, message: 'Homecoming event added successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to add homecoming event.' });
  }
});

// Route for Admin View Homecoming
app.get('/admin/homecoming/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'viewHomecoming.html'));
});

/*************************** View All Events *****************************************/
app.get('/admin/home/homecoming/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * 
      FROM homecoming 
      ORDER BY date_time DESC;
    `);

    res.json({ success: true, events: result.rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});



// Route for Admin Edit Event Page
app.get('/admin/home/homecoming/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'editHomecoming.html'));
});

/*************************** Route for get homecoming by ID *****************************************/
app.get('/admin/home/homecoming/get/:hid', async (req, res) => {
  const { hid } = req.params;

  try {
    const result = await pool.query('SELECT * FROM homecoming WHERE hid = $1', [hid]);

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Homecoming event not found.' });
    }

    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to retrieve Homecoming event.' });
  }
});

/***************************Update Homecoming event by ID *****************************************/
app.post('/admin/home/homecoming/alter', async (req, res) => {
  const { hid, eventName, theme, dateTime, venue } = req.body;

  if (!hid || !eventName || !theme || !dateTime || !venue) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE homecoming
       SET event_name = $1,
           theme = $2,
           date_time = $3,
           venue = $4
       WHERE hid = $5`,
      [eventName, theme, dateTime, venue, hid]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false, message: 'Homecoming event not found.' });
    }

    res.json({ success: true, message: 'Homecoming event updated successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to update Homecoming event.' });
  }
});













// Helper to get local LAN IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const addr of interfaces[iface]) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return 'localhost';
}

// Start server
app.listen(port, host, async () => {
  const localIP = getLocalIP();
  console.log(`Server running at http://${localIP}:${port}`);

  if (process.env.USE_NGROK === 'true') {
    const url = await ngrok.connect(port);
    console.log(`Public URL via ngrok: ${url}`);
  }
});
