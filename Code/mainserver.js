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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'FrontEnd')));

// PostgreSQL pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

/****************************** FRONTEND ROUTES ******************************/
const sendPage = (file) => (req, res) => res.sendFile(path.join(__dirname, 'FrontEnd', file));

// SuperMain & Admin
app.get('/', (req, res) => res.redirect('/admin'));
app.get('/admin', sendPage('superMain.html'));
app.get('/admin/loginPage', sendPage('admin_login.html'));
app.get('/admin/home', sendPage('admin_home.html'));

// Section Pages
app.get('/admin/home/section', sendPage('section.html'));
app.get('/admin/home/section/addSection', sendPage('addSection.html'));
app.get('/admin/home/section/viewSection', sendPage('viewSection.html'));
app.get('/admin/home/section/editSection', sendPage('editSection.html'));

// Members Pages
app.get('/admin/home/members', sendPage('members.html'));
app.get('/admin/home/members/addMembers', sendPage('addMembers.html'));
app.get('/admin/home/members/viewMembers', sendPage('viewMembers.html'));
app.get('/admin/home/members/editMembers', sendPage('editMembers.html'));

// Events / Accountability Pages
app.get('/admin/home/accountability', sendPage('accountability_home.html'));
app.get('/admin/home/accountability/addEvent', sendPage('addEvent.html'));
app.get('/admin/home/accountability/viewEvent', sendPage('viewEvent.html'));
app.get('/admin/home/accountability/editEvent', sendPage('editEvent.html'));

// User Pages
app.get('/user/login', sendPage('app_user_login.html'));
app.get('/user/login/registerEvent', sendPage('registerEvent.html'));
app.get('/user/home', sendPage('user_home.html'));

/****************************** AUTH ROUTES ******************************/
// Admin Login
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin WHERE username=$1 AND password=$2', [username, password]);
    if (result.rows.length > 0) res.json({ success: true, message: 'Login successful' });
    else res.json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM app_user WHERE username=$1 AND password=$2', [username, password]);
    if (result.rows.length > 0) res.json({ success: true, message: 'Login successful' });
    else res.json({ success: false, message: 'Invalid username or password' });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****************************** SECTION CRUD ******************************/
// Add Section
app.post('/api/sections', async (req, res) => {
  const { sectionName, gradeLevel, academicYear, adviser } = req.body;
  if (!sectionName || sectionName.length > 100) return res.status(400).json({ success: false, message: 'Invalid section name' });
  try {
    const existing = await pool.query('SELECT * FROM section WHERE section_name=$1', [sectionName]);
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: 'Section already exists' });
    const result = await pool.query(
      'INSERT INTO section (section_name, grade_level, academic_year, adviser) VALUES ($1,$2,$3,$4) RETURNING *',
      [sectionName, gradeLevel || null, academicYear || null, adviser || null]
    );
    res.status(201).json({ success: true, section: result.rows[0] });
  } catch (err) {
    console.error('Add section error:', err);
    res.status(500).json({ success: false, message: 'Server error adding section' });
  }
});

// Get All Sections
app.get('/api/sections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM section ORDER BY section_name ASC');
    res.json({ success: true, sections: result.rows });
  } catch (err) {
    console.error('Get sections error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sections' });
  }
});

// Get Section by ID
app.get('/api/sections/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM section WHERE section_id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.json({ success: false, message: 'Section not found' });
    res.json({ success: true, section: result.rows[0] });
  } catch (err) {
    console.error('Get section by ID error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch section' });
  }
});

//Section List
app.get('/api/sections/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT section_id, section_name FROM section ORDER BY section_name');
    res.json({ success: true, sections: result.rows });
  } catch (err) {
    console.error('Get sections list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sections' });
  }
});


// Update Section
app.put('/api/sections/:id', async (req, res) => {
  const { section_name, grade_level, academic_year, adviser } = req.body;
  try {
    const result = await pool.query(
      'UPDATE section SET section_name=$1, grade_level=$2, academic_year=$3, adviser=$4 WHERE section_id=$5 RETURNING *',
      [section_name, grade_level, academic_year, adviser, req.params.id]
    );
    if (result.rows.length === 0) return res.json({ success: false, message: 'Section not found' });
    res.json({ success: true, section: result.rows[0] });
  } catch (err) {
    console.error('Update section error:', err);
    res.status(500).json({ success: false, message: 'Failed to update section' });
  }
});

// Delete Section
app.delete('/api/sections/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM section WHERE section_id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete section error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
});

/****************************** MEMBER CRUD ******************************/
// Add Member
/***************************Route for add member*****************************************/

app.post('/admin/home/members/add', async (req, res) => {
  let { studentNumber, lastName, firstName, middleName, sex, section, email } = req.body;

  // Convert to strings explicitly
  studentNumber = String(studentNumber);
  lastName = String(lastName);
  firstName = String(firstName);
  middleName = middleName ? String(middleName) : '';
  sex = String(sex);
  section = String(section);
  email = String(email);

  // Validation regex
  const studentNumberRegex = /^[0-9]{12}$/;
  const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
  const sexRegex = /^(Male|Female)$/i;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !studentNumberRegex.test(studentNumber) ||
    !nameRegex.test(lastName) ||
    !nameRegex.test(firstName) ||
    (middleName && !nameRegex.test(middleName)) ||
    !sexRegex.test(sex) ||
    !section || // section must not be empty
    !emailRegex.test(email)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    // Check for duplicate student number
    const existing = await pool.query('SELECT * FROM students WHERE sid = $1', [studentNumber]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Student number already exists.' });
    }

    // Insert new member
    await pool.query(
      `INSERT INTO students (sid, last_name, first_name, middle_name, sex, section, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [studentNumber, lastName, firstName, middleName, sex, section, email]
    );

    res.json({ success: true, message: 'Member added successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.json({ success: false, message: 'Failed to add member.' });
  }
});



/***************************View All Members*****************************************/
app.get('/admin/home/members/list', async (req, res) => {
  try {
    // Fetch all members, include section name from students table
    const result = await pool.query(`
      SELECT sid, first_name, last_name, middle_name, sex, section, email
      FROM students
      ORDER BY last_name, first_name
    `);

    res.json({ success: true, members: result.rows });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});


// Get Member by SID
app.get('/admin/home/members/get/:sid', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE sid=$1', [req.params.sid]);
    if (result.rows.length === 0) return res.json({ success: false, message: 'Member not found' });
    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    console.error('Get member by SID error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch member' });
  }
});

// Update Member
app.put('/admin/home/members/alter/:sid', async (req, res) => {
  const { sid } = req.params; // sid from URL
  const { lastName, firstName, middleName, sex, section, email } = req.body;

  const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
  const sexRegex = /^(Male|Female|Other)$/i;
  const sectionRegex = /^[A-Za-z0-9]{1,10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !nameRegex.test(lastName) || !nameRegex.test(firstName) ||
    (middleName && !nameRegex.test(middleName)) ||
    !sexRegex.test(sex) || !sectionRegex.test(section) ||
    !emailRegex.test(email)
  ) {
    return res.status(400).json({ success: false, message: 'Invalid input format.' });
  }

  try {
    const existing = await pool.query('SELECT * FROM students WHERE sid = $1', [sid]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    await pool.query(
      `UPDATE students
       SET last_name = $2,
           first_name = $3,
           middle_name = $4,
           sex = $5,
           section = $6,
           email = $7
       WHERE sid = $1`,
      [sid, lastName, firstName, middleName || '', sex, section, email]
    );

    res.json({ success: true, message: 'Member updated successfully!' });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ success: false, message: 'Server error while updating member.' });
  }
});


// Delete Member
app.delete('/admin/home/members/delete/:sid', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE sid=$1', [req.params.sid]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

/****************************** EVENT CRUD ******************************/
// Add Event
app.post('/api/events', async (req, res) => {
  const {
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
  } = req.body;

  if (!nameOfEvent || nameOfEvent.length > 100) 
    return res.status(400).json({ success: false, message: 'Invalid event name' });
  if (!startDate) 
    return res.status(400).json({ success: false, message: 'Start date is required' });

  try {
    const existing = await pool.query('SELECT * FROM events WHERE event_name=$1', [nameOfEvent]);
    if (existing.rows.length > 0) 
      return res.status(400).json({ success: false, message: 'Event already exists' });

    const dateTime = time ? `${startDate} ${time}` : null;

    const result = await pool.query(
      `INSERT INTO events (
        event_name, type, theme, location, start_date, end_date, date_time, amount, payment_due, payment_instructions
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [nameOfEvent, eventType || 'General', theme || null, location || null, startDate, endDate || null, dateTime, amount || 0, dueDate || null, paymentInstructions || null]
    );

    res.status(201).json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('Add event error:', err);
    res.status(500).json({ success: false, message: 'Server error adding event' });
  }
});

// Get All Events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY start_date DESC');
    res.json({ success: true, events: result.rows });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching events' });
  }
});


/****************************** EVENT DETAIL & UPDATE ******************************/

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


/// Update event details
app.post('/admin/home/events/alter', async (req, res) => {
  const { eventId, nameOfEvent, startDate, endDate, amount } = req.body;

  if (!eventId || !nameOfEvent || !startDate || !endDate || amount == null) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE events
       SET event_name=$1,
           start_date=$2,
           end_date=$3,
           amount=$4
       WHERE eid=$5
       RETURNING *`,
      [nameOfEvent, startDate, endDate, amount, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event updated successfully', event: result.rows[0] });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ success: false, message: 'Server error updating event' });
  }
});




// Delete Event
app.delete('/api/events/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const result = await pool.query('DELETE FROM events WHERE eid=$1 RETURNING *', [eid]);
    if (result.rows.length === 0) 
      return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting event' });
  }
});

app.put('/api/events/:eid/publish', async (req, res) => {
  const { eid } = req.params;
  const { is_published } = req.body;
  try {
    const result = await pool.query('UPDATE events SET is_published=$1 WHERE eid=$2 RETURNING *', [is_published, eid]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ success: false, message: 'Server error updating publish state' });
  }
});

app.post('/api/events/:eid/register', async (req, res) => {
  const { eid } = req.params;
  const { sid, registered } = req.body;
  try {
    if (registered) {
      await pool.query('INSERT INTO event_participation (sid, eid) VALUES ($1,$2) ON CONFLICT DO NOTHING', [sid, eid]);
    } else {
      await pool.query('DELETE FROM event_participation WHERE sid=$1 AND eid=$2', [sid, eid]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error updating registration' });
  }
});

/****************************** EVENT PARTICIPANTS & ATTENDANCE ******************************/

// Get participants for Payments (whether they have paid)
app.get('/api/events/:eid/participants', async (req, res) => {
  const { eid } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.sid, s.last_name, s.first_name, s.section,
             CASE WHEN ep.sid IS NOT NULL THEN true ELSE false END AS paid
      FROM students s
      LEFT JOIN event_participation ep ON s.sid = ep.sid AND ep.eid = $1
      ORDER BY s.last_name, s.first_name
    `, [eid]);

    res.json({ success: true, participants: result.rows });
  } catch (err) {
    console.error('Fetch participants error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch participants' });
  }
});

// Get attendees for Attendance (whether they attended)
app.get('/api/events/:eid/attendees', async (req, res) => {
  const { eid } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.sid, s.last_name, s.first_name, s.section,
             CASE WHEN ea.sid IS NOT NULL THEN true ELSE false END AS attended
      FROM students s
      LEFT JOIN event_attendance ea ON s.sid = ea.sid AND ea.eid = $1
      ORDER BY s.last_name, s.first_name
    `, [eid]);

    res.json({ success: true, attendees: result.rows });
  } catch (err) {
    console.error('Fetch attendees error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendees' });
  }
});

// Update attendees (POST)
app.post('/api/events/:eid/attendees', async (req, res) => {
  const { eid } = req.params;
  const { updates } = req.body; // [{sid, attended}, ...]

  if (!Array.isArray(updates)) return res.status(400).json({ success: false, message: 'Invalid data' });

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const u of updates) {
        if (u.attended) {
          await client.query(`
            INSERT INTO event_attendance (sid, eid) VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [u.sid, eid]);
        } else {
          await client.query(`DELETE FROM event_attendance WHERE sid=$1 AND eid=$2`, [u.sid, eid]);
        }
      }

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Update attendees transaction error:', err);
      res.status(500).json({ success: false, message: 'Failed to update attendance' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


/****************************** SERVER START ******************************/
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const addr of interfaces[iface]) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return 'localhost';
}

app.listen(port, host, async () => {
  const localIP = getLocalIP();
  console.log(`Server running at http://${localIP}:${port}`);
  if (process.env.USE_NGROK === 'true') {
    const url = await ngrok.connect(port);
    console.log(`Public URL via ngrok: ${url}`);
  }
});
