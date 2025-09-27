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
