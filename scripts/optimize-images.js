const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  {
    input: 'static/images/editorial-jobs-find-you.jpg',
    output: 'static/images/editorial-jobs-find-you-optimized.webp'
  },
  {
    input: 'static/images/editorial-your-schedule.jpg',
    output: 'static/images/editorial-your-schedule-optimized.webp'
  },
  {
    input: 'static/images/joyful-girl-office-worker-shows-ok-sign-portrait-woman-pants-light-blouse-workplace.jpg',
    output: 'static/images/joyful-girl-office-optimized.webp'
  },
  {
    input: 'static/images/pretty-gorgeous-woman-use-spray-eyes-feeling-good-after-long-laptop-use-sitting-home.jpg',
    output: 'static/images/woman-laptop-optimized.webp'
  }
];

async function optimizeImages() {
  for (const image of images) {
    await sharp(image.input)
      .resize(800, 600, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(image.output);
    
    console.log(`Optimized: ${image.output}`);
  }
}

optimizeImages().catch(console.error); 