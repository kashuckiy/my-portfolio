const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');

module.exports = function (requireAuth) {
  const router = express.Router();
  const userId = 1;

  // === LOGIN ===
  router.get('/login', (req, res) => {
    res.render('admin-login', { error: null });
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rowCount === 0) return res.render('admin-login', { error: 'User not found' });

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.render('admin-login', { error: 'Incorrect password' });

    req.session.adminId = admin.id;
    res.redirect('/admin');
  });

  router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  });

  // === SECURE ROUTS ===
  router.get('/', requireAuth, async (req, res) => {
    const user = (await db.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
    const skills = (await db.query('SELECT * FROM skills WHERE user_id = $1', [userId])).rows;
    const jobs = (await db.query('SELECT * FROM jobs WHERE user_id = $1', [userId])).rows;
    res.render('admin', { user, skills, jobs });
  });

  router.post('/update-user', requireAuth, async (req, res) => {
    const { firstname, lastname, nikname, position, photo_url } = req.body;
    await db.query(`UPDATE users SET firstname=$1, lastname=$2, nikname=$3, position=$4, photo_url=$5 WHERE id=$6`,
      [firstname, lastname, nikname, position, photo_url, userId]);
    res.redirect('/admin');
  });

  router.post('/add-skill', requireAuth, async (req, res) => {
    const { name, rating } = req.body;
    await db.query('INSERT INTO skills (name, rating, user_id) VALUES ($1, $2, $3)', [name, rating, userId]);
    res.redirect('/admin');
  });

  router.post('/delete-skill', requireAuth, async (req, res) => {
    const { id } = req.body;
    await db.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [id, userId]);
    res.redirect('/admin');
  });

  router.post('/add-job', requireAuth, async (req, res) => {
    const { title, company, responsibility } = req.body;
    await db.query('INSERT INTO jobs (title, company, responsibility, user_id) VALUES ($1, $2, $3, $4)',
      [title, company, responsibility, userId]);
    res.redirect('/admin');
  });

  router.post('/delete-job', requireAuth, async (req, res) => {
    const { id } = req.body;
    await db.query('DELETE FROM jobs WHERE id = $1 AND user_id = $2', [id, userId]);
    res.redirect('/admin');
  });

  // === CHANGE PASSWORD ===
  router.get('/change-password', requireAuth, (req, res) => {
    res.render('admin-password', { error: null, success: null });
  });

  router.post('/change-password', requireAuth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await db.query('SELECT * FROM admins WHERE id = $1', [req.session.adminId]);
    const admin = result.rows[0];

    const match = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!match) return res.render('admin-password', { error: 'Old password incorrect', success: null });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newHash, admin.id]);

    res.render('admin-password', { error: null, success: 'The password successfully updated' });
  });

  return router;
}
