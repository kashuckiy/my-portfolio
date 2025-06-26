const express = require('express');
const app = express();
const db = require('./db');

app.set('view engine', 'ejs');
app.use(express.static('public'));

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
