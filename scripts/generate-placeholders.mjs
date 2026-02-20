import { writeFileSync } from "fs";

// Create an SVG placeholder and save as files
// These will be simple but professional-looking placeholders

function createPlaceholder(label, bgColor1, bgColor2, iconPath) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor1}"/>
      <stop offset="100%" style="stop-color:${bgColor2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <!-- Circle decoration -->
  <circle cx="200" cy="600" r="250" fill="rgba(255,255,255,0.03)"/>
  <circle cx="1000" cy="200" r="300" fill="rgba(255,255,255,0.03)"/>
  <!-- Tire icon -->
  <g transform="translate(600,350)">
    ${iconPath}
  </g>
  <!-- Label -->
  <text x="600" y="560" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="28" font-weight="bold">${label}</text>
  <text x="600" y="600" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="16">CarProBan - Bengkel Ban Profesional</text>
</svg>`;
}

const tireIcon = `<circle cx="0" cy="0" r="100" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="12"/>
    <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
    <circle cx="0" cy="0" r="35" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="10"/>
    <circle cx="0" cy="0" r="12" fill="rgba(255,255,255,0.3)"/>
    <line x1="0" y1="-35" x2="0" y2="-70" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
    <line x1="0" y1="35" x2="0" y2="70" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
    <line x1="-35" y1="0" x2="-70" y2="0" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
    <line x1="35" y1="0" x2="70" y2="0" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>`;

const wrenchIcon = `<circle cx="0" cy="0" r="90" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
    <rect x="-8" y="-80" width="16" height="100" rx="4" fill="rgba(255,255,255,0.3)" transform="rotate(45)"/>
    <rect x="-8" y="-80" width="16" height="100" rx="4" fill="rgba(255,255,255,0.3)" transform="rotate(-45)"/>
    <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6"/>`;

const gaugeIcon = `<circle cx="0" cy="0" r="90" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="10"/>
    <circle cx="0" cy="0" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4" stroke-dasharray="12 8"/>
    <line x1="0" y1="0" x2="40" y2="-60" stroke="rgba(255,255,255,0.4)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.3)"/>`;

const stackIcon = `<ellipse cx="0" cy="30" rx="80" ry="25" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="8"/>
    <ellipse cx="0" cy="0" rx="80" ry="25" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="8"/>
    <ellipse cx="0" cy="-30" rx="80" ry="25" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="8"/>
    <ellipse cx="0" cy="-60" rx="80" ry="25" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>`;

const images = [
    { name: "hero-tire", label: "Bengkel Ban Profesional", bg1: "#0f172a", bg2: "#1e3a5f", icon: tireIcon },
    { name: "service-repair", label: "Layanan Tambal Ban", bg1: "#1a1a2e", bg2: "#16213e", icon: wrenchIcon },
    { name: "service-balancing", label: "Spooring & Balancing", bg1: "#0d1b2a", bg2: "#1b2838", icon: gaugeIcon },
    { name: "service-replacement", label: "Ganti Ban Baru", bg1: "#1a1423", bg2: "#2d1b3d", icon: stackIcon },
];

for (const img of images) {
    const svg = createPlaceholder(img.label, img.bg1, img.bg2, img.icon);
    writeFileSync(`public/images/${img.name}.svg`, svg);
    console.log(`✅ Created: public/images/${img.name}.svg`);
}

console.log("\nDone! All placeholder images created.");
