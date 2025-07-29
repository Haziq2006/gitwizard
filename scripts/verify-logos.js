import fs from 'fs';
import path from 'path';

const logosDir = path.join(process.cwd(), 'public', 'logos');
const expectedLogos = [
  'aws.svg',
  'stripe.svg',
  'github.svg',
  'openai.svg',
  'anthropic.svg',
  'huggingface.svg',
  'cohere.svg',
  'deepseek.svg',
  'azure.svg',
  'googlecloud.svg',
  'firebase.svg',
  'sendgrid.svg',
  'twilio.svg',
  'mailgun.svg',
  'mongodb.svg',
  'postgresql.svg',
  'redis.svg',
  'mysql.svg',
  'jwt.svg',
  'ssh.svg',
  'api.svg'
];

console.log('🔍 Verifying logo files...\n');

let allExist = true;

expectedLogos.forEach(logoFile => {
  const filePath = path.join(logosDir, logoFile);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${logoFile} - ${stats.size} bytes`);
  } else {
    console.log(`❌ ${logoFile} - MISSING`);
    allExist = false;
  }
});

console.log('\n📊 Summary:');
if (allExist) {
  console.log('✅ All logo files exist!');
} else {
  console.log('❌ Some logo files are missing!');
  console.log('Please check the public/logos directory.');
}

// Check for extra files
const actualFiles = fs.readdirSync(logosDir).filter(file => file.endsWith('.svg'));
const extraFiles = actualFiles.filter(file => !expectedLogos.includes(file));

if (extraFiles.length > 0) {
  console.log('\n📁 Extra files found:');
  extraFiles.forEach(file => console.log(`   - ${file}`));
} 