const https = require('https');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function uploadToGitHub(file) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return { ok: false, service: 'GitHub' };
  }

  const fileName = path.basename(file.path);
  const fileBuffer = fs.readFileSync(file.path);
  const content = fileBuffer.toString('base64');
  const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${fileName}`;

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Personal-Document-Vault'
      }
    }, (res) => {
      res.resume();
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, service: 'GitHub' }));
    });

    req.on('error', () => resolve({ ok: false, service: 'GitHub' }));
    req.write(JSON.stringify({ message: 'Upload via Personal Document Vault', content }));
    req.end();
  });
}

async function uploadToGoogleDrive(file) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { ok: false, service: 'Google Drive' };
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: path.basename(file.originalname),
    parents: [folderId]
  };
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path)
  };

  try {
    await drive.files.create({
      requestBody: fileMetadata,
      media
    });
    return { ok: true, service: 'Google Drive' };
  } catch (error) {
    return { ok: false, service: 'Google Drive' };
  }
}

module.exports = { uploadToGitHub, uploadToGoogleDrive };
