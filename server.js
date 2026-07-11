const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'vault-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false }
}));

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

app.use('/', authRoutes);
app.use('/', documentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  return res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Personal Document Vault running at http://localhost:${port}`);
});
