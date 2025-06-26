const express = require('express');
const session = require('express-session');
const app = express();
const db = require('./db');
const path = require('path');
require('dotenv').config();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// session config
app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));

// middleware to protect /admin
function requireAuth(req, res, next) {
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
}

const adminRoutes = require('./routes/admin')(requireAuth);
app.use('/admin', adminRoutes);

app.get('/', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users LIMIT 1');
    const skills = await db.query('SELECT * FROM skills');
    const jobs = await db.query('SELECT * FROM jobs ORDER BY id DESC');

    res.render('index', {
      user: user.rows[0],
      skills: skills.rows,
      jobs: jobs.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
