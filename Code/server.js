
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const os = require('os');
const ngrok = require('ngrok');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

// Enable CORS for cross-device access
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
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

const localIP = getLocalIP();

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Server is running!</h1>
    <p>LAN access: <a href="http://${localIP}:${port}">http://${localIP}:${port}</a></p>
    <p>Admins: <a href="http://${localIP}:${port}/admins">/admins</a></p>
    <p>Students: <a href="http://${localIP}:${port}/students">/students</a></p>
  `);
});

app.get('/admins', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admin');
    let html = `<h1>Admin List</h1><ul>`;
    result.rows.forEach(admin => {
      html += `<li>${admin.aid} - ${admin.username}</li>`;
    });
    html += `</ul>`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.get('/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    let html = `<h1>Student List</h1><ul>`;
    result.rows.forEach(student => {
      html += `<li>${student.sid} - ${student.first_name} ${student.last_name} (${student.section})</li>`;
    });
    html += `</ul>`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// Start server and optionally create ngrok tunnel
async function startServer() {
  app.listen(port, host, async () => {
    console.log(`Server running at http://${localIP}:${port}`);

    if (process.env.ENABLE_NGROK === 'true') {
      try {
        const url = await ngrok.connect(port);
        console.log(`Public ngrok URL: ${url}`);
      } catch (err) {
        console.error('Ngrok failed:', err);
      }
    }
  });
}

startServer();
