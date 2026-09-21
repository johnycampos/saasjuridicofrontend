/**
 * Gera ícones PWA para JurisFlow usando SVG + sharp.
 * Execute de dentro de D:\desenvolvimento\sasjuridico\frontend\
 * com: node scripts/generate-pwa-icons.js
 *
 * Cores calculadas com culori (ver scripts/convert-colors.js):
 *   --navy = oklch(0.28 0.04 255)  → #1b2a3c
 *   --bg   = oklch(0.985 0.003 85) → #fbfaf8
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.resolve(__dirname, '..', 'public');

// Cores exatas convertidas com culori (não conversão manual)
const NAVY_HEX = '#1b2a3c';  // oklch(0.28 0.04 255)
const WHITE = '#ffffff';
const BG_HEX = '#fbfaf8';    // oklch(0.985 0.003 85)

function svgIcon(size, opts = {}) {
  const { maskable = false, appleTouchIcon = false } = opts;
  const bg = appleTouchIcon ? BG_HEX : NAVY_HEX;
  const fg = appleTouchIcon ? NAVY_HEX : WHITE;

  // Regras de geometria do fundo:
  // - maskable: full-bleed sem rx/ry (OS aplica a própria máscara)
  // - apple-touch-icon: full-bleed sem rx/ry (iOS aplica squircle por conta
  //   própria; arredondar aqui deixa cantos transparentes — achado Lince)
  // - ícone normal: border-radius proporcional ao 7px/56px original (~12-14%)
  const isFullBleed = maskable || appleTouchIcon;
  const r = isFullBleed ? 0 : Math.round(size * 0.14);

  const rect = isFullBleed
    ? `<rect width="${size}" height="${size}" fill="${bg}"/>`
    : `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${bg}"/>`;

  const fontSize = maskable ? Math.round(size * 0.36) : Math.round(size * 0.44);
  const cy = Math.round(size / 2 + fontSize * 0.05);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${rect}
  <text
    x="${size / 2}"
    y="${cy}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-style="italic"
    font-weight="600"
    font-size="${fontSize}"
    fill="${fg}"
  >J</text>
</svg>`;
}

async function main() {
  if (!fs.existsSync(OUT)) {
    fs.mkdirSync(OUT, { recursive: true });
    console.log('Criado:', OUT);
  }

  const specs = [
    { name: 'icon-192.png',          size: 192 },
    { name: 'icon-512.png',          size: 512 },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png',  size: 180, appleTouchIcon: true },
  ];

  for (const spec of specs) {
    const svg = svgIcon(spec.size, { maskable: spec.maskable, appleTouchIcon: spec.appleTouchIcon });
    const pngBuf = await sharp(Buffer.from(svg)).resize(spec.size, spec.size).png().toBuffer();
    fs.writeFileSync(path.join(OUT, spec.name), pngBuf);
    console.log(`✓ ${spec.name} (${spec.size}px)`);
  }

  // favicon.ico: PNG 32x32 renomeado como .ico (browsers modernos aceitam PNG como ICO)
  const faviconSvg = svgIcon(32);
  const faviconPng = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), faviconPng);
  console.log('✓ favicon.ico (32px PNG-as-ICO)');

  console.log('\nTodos os ícones gerados em:', OUT);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
