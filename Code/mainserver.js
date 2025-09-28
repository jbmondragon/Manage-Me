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

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'app_user_login.html'));
});

// Admin home route
app.get('/user/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'user_home.html'));
});

// Admin home route
app.get('/admin/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'admin_home.html'));
});

// Admin home route
app.get('/admin/home/members', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'members.html'));
});

// Admin addMember route
app.get('/admin/home/members/addMembers', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'addMembers.html'));
});

// Admin viewMember route
app.get('/admin/home/members/viewMembers', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'viewMembers.html'));
});



// Login app_user route
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

// route for add member
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

// Get all members
app.get('/admin/home/members/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY last_name, first_name');
    res.json({ success: true, members: result.rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});


// Delete member by sid
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

// Edit member (GET for details, POST/PUT for update)
app.get('/admin/home/members/edit', async (req, res) => {
  const { sid } = req.query;
  // return member data for editing
});

app.post('/admin/home/members/edit', async (req, res) => {
  const { sid, last_name, first_name, middle_name, suffix, sex, section, email } = req.body;
  // update member in database
});


// Route for admin (login page)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'admin_login.html'));
});

// Admin login route
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
