const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

let user = '';
let pass = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('EMAIL_USER=')) {
    user = line.split('=')[1].trim();
  }
  if (line.startsWith('EMAIL_PASSWORD=')) {
    pass = line.split('=').slice(1).join('=').trim();
  }
});

console.log('Testing with User:', user, 'and Password length:', pass.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass
  }
});

transporter.verify()
  .then(() => console.log('SUCCESS: Nodemailer authentication works!'))
  .catch((err) => console.error('ERROR:', err.message));
