const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal 1x1 valid PNG pixel buffer duplicated to create icons if raw PNG needed, or write SVG icons
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0f172a"/>
  <path d="M256 96L384 224H288V416H224V224H128L256 96Z" fill="#10b981"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#10b981" stroke-width="24"/>
  <text x="256" y="330" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle">AKAR</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), svgContent);
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), svgContent);

console.log('App icons generated successfully');
