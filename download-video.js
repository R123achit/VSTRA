// Simple script to download FREE 4K fashion video (similar to Getty Images beach sunset)
const https = require('https');
const fs = require('fs');
const path = require('path');

// Free 4K fashion video from Pexels - Woman in dress walking (similar to Getty video)
const videoUrl = 'https://videos.pexels.com/video-files/3048379/3048379-hd_1920_1080_25fps.mp4';
const outputPath = path.join(__dirname, 'public', 'videos', 'fashion-hero.mp4');

// Create directory if it doesn't exist
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log('Downloading video...');
console.log('This may take a minute...\n');

const file = fs.createWriteStream(outputPath);

https.get(videoUrl, (response) => {
  const totalSize = parseInt(response.headers['content-length'], 10);
  let downloadedSize = 0;

  response.on('data', (chunk) => {
    downloadedSize += chunk.length;
    const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
    process.stdout.write(`\rProgress: ${percent}%`);
  });

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('\n\n✅ Video downloaded successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('\nYou can now use it in your Hero component.');
  });
}).on('error', (err) => {
  fs.unlink(outputPath, () => {});
  console.error('\n❌ Error downloading video:', err.message);
});
