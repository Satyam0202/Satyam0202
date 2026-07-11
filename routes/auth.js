const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { error: '' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const expectedUser = process.env.VAULT_USERNAME || process.env.USERNAME || 'satyam02';
  const expectedPass = process.env.VAULT_PASSWORD || process.env.PASSWORD || 'Muskan!0202';

  if (username === expectedUser && password === expectedPass) {
    req.session.user = { username };
    return res.redirect('/dashboard');
  }

  return res.render('login', { error: 'Invalid username or password.' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
