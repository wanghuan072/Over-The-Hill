import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
// Original site illustration and vector identity; this is promotional site art, not a game screenshot.
const background = await sharp("public/images/home-v3/hero.webp")
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
const logo = await readFile("public/images/logo.svg");
const overlay = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="shade"><stop stop-color="#142b22" stop-opacity=".96"/><stop offset="1" stop-color="#142b22" stop-opacity=".15"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><rect x="38" y="38" width="1124" height="554" rx="16" fill="none" stroke="#f2d19b" stroke-opacity=".45"/><text x="74" y="207" fill="#ecc68e" font-family="Arial" font-size="17" font-weight="700" letter-spacing="5">THE EXPLORER’S FIELD GUIDE</text><text x="70" y="297" fill="#fff7df" font-family="Arial" font-size="72" font-weight="900">OVER THE HILL</text><text x="74" y="355" fill="#fff7df" font-family="Arial" font-size="39" font-weight="700">WIKI &amp; FIELD GUIDE</text><path d="M74 389h83" stroke="#df9a50" stroke-width="5"/><text x="74" y="441" fill="#e4e7cc" font-family="Arial" font-size="23">Vehicles. Maps. Gear. The next discovery.</text><text x="74" y="541" fill="#ecc68e" font-family="Arial" font-size="19" letter-spacing="2">OVERTHEHILLHUB.COM</text><text x="1120" y="555" fill="#fff7df" text-anchor="end" font-family="Arial" font-size="12">INDEPENDENT FAN SITE · ORIGINAL ILLUSTRATION</text></svg>`,
);
await sharp(background)
  .composite([
    { input: overlay },
    { input: await sharp(logo).resize(80, 80).toBuffer(), left: 74, top: 72 },
  ])
  .png()
  .toFile("public/images/og-image.png");
await sharp(logo).resize(180, 180).png().toFile("src/app/apple-icon.png");
await writeFile("src/app/icon.svg", logo);
console.log("Created logo, app icons and 1200×630 social image.");
