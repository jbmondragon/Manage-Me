/****************************** IMPORTS & SETUP ******************************/
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const os = require('os');
const session = require('express-session');
const { createClient } = require('redis');
const RedisStore = require('connect-redis')(session);
const ngrok = require('ngrok');

const app = express();
const host = process.env.HOST || '0.0.0.0';

/****************************** REDIS SESSION SETUP ******************************/
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  legacyMode: true // needed for connect-redis compatibility
});

redisClient.connect().catch(console.error);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'super-secret-key', // use strong secret in production
    resave: false,                // recommended
    saveUninitialized: false,     // recommended
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

/******************************* MIDDLEWARE ******************************/
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'FrontEnd')));

/****************************** DATABASE POOL ******************************/
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

/****************************** FRONTEND ROUTES ******************************/
const sendPage = (file) => (req, res) => res.sendFile(path.join(__dirname, 'FrontEnd', file));

/* Basic Pages */
app.get('/', (req, res) => res.redirect('/admin'));
app.get('/admin', sendPage('superMain.html'));
app.get('/admin/loginPage', sendPage('admin_login.html'));
app.get('/admin/home', sendPage('admin_home.html'));
app.get('/about', sendPage('about.html'));

/* Section Pages */
app.get('/admin/home/section', sendPage('section.html'));
app.get('/admin/home/section/addSection', sendPage('addSection.html'));
app.get('/admin/home/section/viewSection', sendPage('viewSection.html'));
app.get('/admin/home/section/editSection', sendPage('editSection.html'));

/* Member Pages */
app.get('/admin/home/members', sendPage('members.html'));
app.get('/admin/home/members/addMembers', sendPage('addMembers.html'));
app.get('/admin/home/members/viewMembers', sendPage('viewMembers.html'));
app.get('/admin/home/members/editMembers', sendPage('editMembers.html'));


/* Event Pages */
app.get('/admin/home/accountability', sendPage('accountability_home.html'));
app.get('/admin/home/accountability/addEvent', sendPage('addEvent.html'));
app.get('/admin/home/accountability/viewEvent', sendPage('viewEvent.html'));
app.get('/admin/home/accountability/editEvent', sendPage('editEvent.html'));

/* User Pages */
app.get('/user/login', sendPage('app_user_login.html'));
app.get('/user/login/registerEvent', sendPage('registerEvent.html'));
app.get('/user/home', sendPage('user_home.html'));

/* Dashboard Page */
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'admin_dashboard.html'));
});


/****************************** AUTH ROUTES ******************************/

/* Admin Login */
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

/* User Login */
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


/*************************************************************************/
/*                            SECTION CRUD                                /
/*************************************************************************/

/* Add Section */
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

/* Get All Sections */
app.get('/api/sections', async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await pool.query(
        'SELECT * FROM section WHERE LOWER(section_name) LIKE LOWER($1) ORDER BY section_name ASC',
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM section ORDER BY section_name ASC');
    }
    res.json({ success: true, sections: result.rows });
  } catch (err) {
    console.error('Get sections error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sections' });
  }
});

/* Get Section by ID */
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

/* Get Sections List (ID and Name only) */
app.get('/api/sections/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT section_id, section_name FROM section ORDER BY section_name');
    res.json({ success: true, sections: result.rows });
  } catch (err) {
    console.error('Get sections list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sections' });
  }
});

/* Update Section */
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

/* Delete Section */
app.delete('/api/sections/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM section WHERE section_id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete section error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
});


/*************************************************************************/
/*                            Member CRUD                                /
/*************************************************************************/

/***************************Route for add member*****************************************/
app.post('/admin/home/members/add', async (req, res) => {
  let { studentNumber, lastName, firstName, middleName, sex, sectionID, email } = req.body;

  /* Input sanitization */
  studentNumber = String(studentNumber).trim();
  lastName = String(lastName).trim();
  firstName = String(firstName).trim();
  middleName = middleName ? String(middleName).trim() : '';
  sex = String(sex).trim();
  email = String(email).trim();

  /* Convert sectionID to integer */
  sectionID = parseInt(sectionID);
  if (isNaN(sectionID)) {
    return res.json({ success: false, message: 'Invalid section ID.' });
  }

  /* Validation regex */
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
    !emailRegex.test(email)
  ) {
    return res.json({ success: false, message: 'Invalid input format.' });
  }

  try {
    /* Check if student number already exists */
    const existing = await pool.query('SELECT * FROM students WHERE sid = $1', [studentNumber]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Student number already exists.' });
    }

    /* Insert new member */
    const result = await pool.query(
      `INSERT INTO students (sid, last_name, first_name, middle_name, sex, section_id, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [studentNumber, lastName, firstName, middleName, sex, sectionID, email]
    );

    res.json({ success: true, message: 'Member added successfully!', student: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to add member.' });
  }
});

/***************************View All Members*****************************************/
app.get('/admin/home/members/list', async (req, res) => {
  try {
    /* Fetch all members with section names */
    const result = await pool.query(`
      SELECT 
        s.sid, 
        s.first_name, 
        s.last_name, 
        s.middle_name, 
        s.sex, 
        sec.section_name AS section, 
        s.email
      FROM students s
      LEFT JOIN section sec ON s.section_id = sec.section_id
      ORDER BY s.last_name, s.first_name
    `);

    res.json({ success: true, members: result.rows });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});

/***************************Update Member*****************************************/

/* Get Member by SID */
app.get('/admin/home/members/get/:sid', async (req, res) => {
  const sidInt = parseInt(req.params.sid, 10);
  if (isNaN(sidInt)) {
    return res.status(400).json({ success: false, message: 'Invalid SID.' });
  }

  try {
    const result = await pool.query(
      'SELECT sid, last_name, first_name, middle_name, sex, section_id, email FROM students WHERE sid=$1',
      [sidInt]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Member not found.' });
    }

    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    console.error('Get member by SID error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch member' });
  }
});

/* Update Member */
app.put('/admin/home/members/alter/:sid', async (req, res) => {
  const sidInt = parseInt(req.params.sid, 10);
  if (isNaN(sidInt)) {
    return res.status(400).json({ success: false, message: 'Invalid SID.' });
  }

  const { lastName, firstName, middleName, sex, sectionID, email } = req.body;

  /* Validation regex */
  const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
  const sexRegex = /^(Male|Female|Other)$/i;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sectionIDInt = parseInt(sectionID, 10);

  if (
    !nameRegex.test(lastName) || !nameRegex.test(firstName) ||
    (middleName && !nameRegex.test(middleName)) ||
    !sexRegex.test(sex) || isNaN(sectionIDInt) ||
    !emailRegex.test(email)
  ) {
    return res.status(400).json({ success: false, message: 'Invalid input format.' });
  }

  try {
    /* Check if member exists */
    const existing = await pool.query('SELECT * FROM students WHERE sid = $1', [sidInt]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    /* Update member details */
    await pool.query(
      `UPDATE students
       SET last_name = $2,
           first_name = $3,
           middle_name = $4,
           sex = $5,
           section_id = $6,
           email = $7
       WHERE sid = $1`,
      [sidInt, lastName, firstName, middleName || '', sex, sectionIDInt, email]
    );

    res.json({ success: true, message: 'Member updated successfully!' });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ success: false, message: 'Server error while updating member.' });
  }
});



/***************************Delete a Member*****************************************/
app.delete('/admin/home/members/delete/:sid', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE sid=$1', [req.params.sid]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

/*************************************************************************/
/*                            SECTION CRUD                                /
/*************************************************************************/

/* Add Event */
app.post('/admin/home/events/add', async (req, res) => {
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
    const existing = await pool.query(
      'SELECT * FROM events WHERE event_name=$1', 
      [nameOfEvent]
    );

    if (existing.rows.length > 0) 
      return res.status(400).json({ success: false, message: 'Event already exists' });

    const dateTime = time ? `${startDate} ${time}` : null;

    const result = await pool.query(
      `INSERT INTO events (
        event_name, type, theme, location, 
        start_date, end_date, date_time, 
        amount, payment_due, payment_instructions
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        nameOfEvent,
        eventType || 'General',
        theme || null,
        location || null,
        startDate,
        endDate || null,
        dateTime,
        amount || 0,
        dueDate || null,
        paymentInstructions || null
      ]
    );

    res.status(201).json({ success: true, event: result.rows[0] });

  } catch (err) {
    console.error('Add event error:', err);
    res.status(500).json({ success: false, message: 'Server error adding event' });
  }
});


/* Get All Events */
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

/* Get Event Details */
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

/* Update Event Details */
app.post('/admin/home/events/alter', async (req, res) => {
  const {
    eventId,
    event_name,
    type,
    theme,
    location,
    start_date,
    date_time,
    end_date,
    amount,
    payment_due,
    payment_instructions
  } = req.body;

  /* Validate required fields */
  if (!eventId || !event_name || !start_date) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: eventId, event_name, start_date'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE events
       SET event_name = $1,
           type = $2,
           theme = $3,
           location = $4,
           start_date = $5,
           date_time = $6,
           end_date = $7,
           amount = $8,
           payment_due = $9,
           payment_instructions = $10
       WHERE eid = $11
       RETURNING *`,
      [
        event_name,
        type || 'General',
        theme || null,
        location || null,
        start_date,
        date_time || null,
        end_date || null,
        amount ? Number(amount) : 0,
        payment_due || null,
        payment_instructions || null,
        eventId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: result.rows[0]
    });

  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});


/* Delete Event */
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

/* Publish/Unpublish Event */
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

/* Register/Unregister for Event */
app.post('/api/events/:eid/register', async (req, res) => {
  const { eid } = req.params;
  const { sid, registered } = req.body;

  try {
    if (registered) {
      await pool.query(
        `INSERT INTO event_participation (sid, eid) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [sid, eid]
      );
    } else {
      await pool.query(
        `DELETE FROM event_participation 
         WHERE sid=$1 AND eid=$2`,
        [sid, eid]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error updating registration' });
  }
});


/****************************** EVENT PARTICIPANTS & ATTENDANCE ******************************/

/* Get participants for Event Participation (whether they paid) */
app.get('/api/events/:eid/participants', async (req, res) => {
  const { eid } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        s.sid,
        s.last_name,
        s.first_name,
        sec.section_name AS section,
        CASE WHEN ep.sid IS NOT NULL THEN true ELSE false END AS paid
      FROM students s
      LEFT JOIN section sec ON sec.section_id = s.section_id
      LEFT JOIN event_participation ep 
            ON ep.sid = s.sid AND ep.eid = $1
      ORDER BY s.last_name, s.first_name
    `, [eid]);

    res.json({ success: true, participants: result.rows });

  } catch (err) {
    console.error('Fetch participants error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch participants' });
  }
});


/* Get attendees for Event Attendance */
app.get('/api/events/:eid/attendees', async (req, res) => {
  const { eid } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        s.sid,
        s.last_name,
        s.first_name,
        sec.section_name AS section,
        CASE WHEN ea.sid IS NOT NULL THEN true ELSE false END AS attended
      FROM students s
      LEFT JOIN section sec ON sec.section_id = s.section_id
      LEFT JOIN attendees ea 
            ON ea.sid = s.sid AND ea.eid = $1
      ORDER BY s.last_name, s.first_name
    `, [eid]);

    res.json({ success: true, attendees: result.rows });

  } catch (err) {
    console.error('Fetch attendees error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendees' });
  }
});

/* Update attendees for Event Attendance */
app.post('/api/events/:eid/attendees', async (req, res) => {
  const { eid } = req.params;
  const { updates } = req.body;

  if (!Array.isArray(updates))
    return res.status(400).json({ success: false, message: 'Invalid data' });

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    for (const u of updates) {
      if (u.attended) {
        await client.query(
          `INSERT INTO attendees (sid, eid)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [u.sid, eid]
        );
      } else {
        await client.query(
          `DELETE FROM attendees 
           WHERE sid=$1 AND eid=$2`,
          [u.sid, eid]
        );
      }
    }

    await client.query('COMMIT');
    client.release();

    res.json({ success: true });

  } catch (err) {
    console.error('Update attendees error:', err);
    res.status(500).json({ success: false, message: 'Failed to update attendance' });
  }
});


/****************************** ANALYTICS ROUTES ******************************/

/* Members by Section */
app.get('/api/analytics/members/sections', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sec.section_name, COUNT(s.sid) AS total_members
      FROM section sec
      LEFT JOIN students s ON sec.section_id = s.section_id
      GROUP BY sec.section_name
      ORDER BY total_members DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Members by section analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

/* Gender Distribution */
app.get('/api/analytics/members/gender', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sex, COUNT(*) AS count
      FROM students
      GROUP BY sex
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Gender distribution analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

/* Event Type Distribution */
app.get('/api/analytics/events/types', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT type, COUNT(*) AS count
      FROM events
      GROUP BY type
      ORDER BY count DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Event type distribution analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

/* Event Attendance */
app.get('/api/analytics/events/attendance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.event_name,
             COUNT(ep.sid) AS registered,
             COUNT(ea.sid) AS attended,
             e.start_date
      FROM events e
      LEFT JOIN event_participation ep ON e.eid = ep.eid
      LEFT JOIN attendees ea ON e.eid = ea.eid
      GROUP BY e.event_name, e.start_date
      ORDER BY e.start_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Event attendance analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});



/****************************** SERVER START ******************************/
const port = process.env.PORT || 3000;

/* Health check endpoint */
app.get('/health', (req, res) => res.send('OK'));

/* Start server */
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  /* Optional: ngrok only for local development */
  if (process.env.NODE_ENV !== 'production' && process.env.USE_NGROK === 'true') {
    const ngrok = require('ngrok');
    try {
      const url = await ngrok.connect(port);
      console.log(`Public URL via ngrok: ${url}`);
    } catch (err) {
      console.error('Ngrok failed to start:', err);
    }
  }
});

