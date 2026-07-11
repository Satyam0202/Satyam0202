const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ensureAuthenticated = require('../middleware/auth');
const { uploadToGitHub, uploadToGoogleDrive } = require('../services/storage');
const router = express.Router();

const defaultCategories = ['Education', 'Identity', 'Career', 'Finance', 'Personal'];
const dataFile = path.join(__dirname, '..', 'utils', 'documents.json');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.UPLOAD_LIMIT_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = (process.env.ALLOWED_EXTENSIONS || 'pdf,jpg,jpeg,png,doc,docx').split(',');
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    cb(null, allowed.includes(ext));
  }
});

function loadDocuments() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8')) || [];
  } catch (error) {
    return [];
  }
}

function saveDocuments(documents) {
  fs.writeFileSync(dataFile, JSON.stringify(documents, null, 2));
}

function getCategories(documents) {
  return [...new Set([...defaultCategories, ...documents.map((doc) => doc.category).filter(Boolean)])];
}

function formatBytes(size) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Number(size);
  let index = 0;
  while (value > 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (['.jpg', '.jpeg', '.png'].includes(ext)) return 'Image';
  if (['.doc', '.docx'].includes(ext)) return 'Word';
  return 'File';
}

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  const documents = loadDocuments();
  const search = (req.query.search || '').trim().toLowerCase();
  const categoryFilter = req.query.category || '';
  const storageFilter = req.query.storage || '';
  const dateFilter = req.query.date || '';
  const typeFilter = req.query.type || '';

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = !search || [doc.name, doc.originalName, doc.category, doc.type].some((value) => String(value).toLowerCase().includes(search));
    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    const matchesStorage = !storageFilter || doc.storage === storageFilter;
    const matchesDate = !dateFilter || new Date(doc.uploadedAt).toISOString().slice(0, 10) === dateFilter;
    const matchesType = !typeFilter || doc.type === typeFilter;
    return matchesSearch && matchesCategory && matchesStorage && matchesDate && matchesType;
  });

  const totalDocuments = documents.length;
  const totalCategories = [...new Set(documents.map((doc) => doc.category).filter(Boolean))].length;
  const recentDocuments = [...documents].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 3);
  const storageSummary = {
    Local: documents.filter((doc) => doc.storage === 'Local').length,
    GitHub: documents.filter((doc) => doc.storage === 'GitHub' || doc.storage === 'Both').length,
    'Google Drive': documents.filter((doc) => doc.storage === 'Google Drive' || doc.storage === 'Both').length
  };

  res.render('dashboard', {
    user: req.session.user,
    documents: filteredDocuments,
    categories: getCategories(documents),
    totalDocuments,
    totalCategories,
    recentDocuments,
    storageSummary,
    filters: { search, categoryFilter, storageFilter, dateFilter, typeFilter }
  });
});

router.post('/documents/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.redirect('/dashboard?error=No file uploaded');
  }

  const documents = loadDocuments();
  const category = (req.body.customCategory || req.body.category || 'Personal').trim() || 'Personal';
  const storageChoice = req.body.storage || 'Local';
  let storageStatus = 'Stored locally';

  if (storageChoice === 'GitHub' || storageChoice === 'Both') {
    const githubResult = await uploadToGitHub(req.file);
    storageStatus = githubResult.ok ? 'Stored in GitHub' : 'GitHub not configured';
  }

  if (storageChoice === 'Google Drive' || storageChoice === 'Both') {
    const driveResult = await uploadToGoogleDrive(req.file);
    storageStatus = driveResult.ok ? `Stored in ${driveResult.service}` : storageStatus;
  }

  const newDocument = {
    id: Date.now(),
    name: path.parse(req.file.originalname).name,
    originalName: req.file.originalname,
    category,
    storage: storageChoice,
    uploadedAt: new Date().toISOString(),
    size: formatBytes(req.file.size),
    type: getFileType(req.file.originalname),
    filePath: req.file.path,
    fileName: req.file.filename,
    status: storageStatus
  };

  documents.push(newDocument);
  saveDocuments(documents);
  res.redirect('/dashboard');
});

router.get('/documents/:id/preview', ensureAuthenticated, (req, res) => {
  const documents = loadDocuments();
  const document = documents.find((doc) => doc.id === Number(req.params.id));
  if (!document || !document.filePath || !fs.existsSync(document.filePath)) {
    return res.status(404).send('File not found');
  }
  const ext = path.extname(document.filePath).toLowerCase();
  if (['.doc', '.docx'].includes(ext)) {
    return res.download(document.filePath, document.originalName || document.name);
  }
  return res.sendFile(document.filePath);
});

router.get('/documents/:id/download', ensureAuthenticated, (req, res) => {
  const documents = loadDocuments();
  const document = documents.find((doc) => doc.id === Number(req.params.id));
  if (!document || !document.filePath || !fs.existsSync(document.filePath)) {
    return res.status(404).send('File not found');
  }
  return res.download(document.filePath, document.originalName || document.name);
});

router.post('/documents/:id/delete', ensureAuthenticated, (req, res) => {
  const documents = loadDocuments();
  const document = documents.find((doc) => doc.id === Number(req.params.id));
  if (document && document.filePath && fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }
  const filtered = documents.filter((doc) => doc.id !== Number(req.params.id));
  saveDocuments(filtered);
  res.redirect('/dashboard');
});

router.post('/documents/:id/rename', ensureAuthenticated, (req, res) => {
  const documents = loadDocuments();
  const document = documents.find((doc) => doc.id === Number(req.params.id));
  if (document) {
    document.name = req.body.name;
    saveDocuments(documents);
  }
  res.redirect('/dashboard');
});

router.post('/documents/:id/update', ensureAuthenticated, (req, res) => {
  const documents = loadDocuments();
  const document = documents.find((doc) => doc.id === Number(req.params.id));
  if (document) {
    document.category = req.body.category;
    document.storage = req.body.storage;
    saveDocuments(documents);
  }
  res.redirect('/dashboard');
});

module.exports = router;
