const fs = require('fs');
const path = require('path');

const files = [
  'hero-pattern-courier.png',
  'hero-pattern-grocery.png',
  'hero-pattern-restaurant.png'
];

files.forEach(file => {
  const filePath = path.join('d:\\Hyperlocal-Yashwantrao-Customization\\web\\public\\assets', file);
  if (!fs.existsSync(filePath)) {
    console.log(`${file} does not exist!`);
    return;
  }
  const stats = fs.statSync(filePath);
  console.log(`${file}: size = ${stats.size} bytes`);
  
  // Read first few bytes to check PNG structure
  const buffer = fs.readFileSync(filePath);
  const colorType = buffer[25]; // PNG color type is at byte 25
  // Color types: 0=Greyscale, 2=RGB, 3=Indexed, 4=Greyscale+Alpha, 6=RGBA
  console.log(`${file}: colorType = ${colorType} (6 means RGBA/transparent)`);
});
