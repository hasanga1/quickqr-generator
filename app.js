document.getElementById('year').textContent = new Date().getFullYear();

const renderTarget = document.getElementById('qr-render');
const downloadBtn = document.getElementById('qr-download-png');
const logoInput = document.getElementById('qr-logo');

let logoImage = null;

logoInput.addEventListener('change', () => {
  const file = logoInput.files[0];
  if (!file) { logoImage = null; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => { logoImage = img; };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

function eclFor(value) {
  return QRCode.CorrectLevel[value] || QRCode.CorrectLevel.M;
}

function generate() {
  const text = document.getElementById('qr-input').value.trim() || 'https://example.com';
  const size = parseInt(document.getElementById('qr-size').value, 10);
  const fg = document.getElementById('qr-fg').value;
  const bg = document.getElementById('qr-bg').value;
  const ecl = eclFor(document.getElementById('qr-ecl').value);

  renderTarget.innerHTML = '';

  new QRCode(renderTarget, {
    text,
    width: size,
    height: size,
    colorDark: fg,
    colorLight: bg,
    correctLevel: ecl,
  });

  // qrcodejs renders async-ish; wait a tick for the canvas to exist.
  setTimeout(() => {
    const canvas = renderTarget.querySelector('canvas');
    if (!canvas) return;

    if (logoImage) {
      const ctx = canvas.getContext('2d');
      const logoSize = size * 0.22;
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      const pad = logoSize * 0.12;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
      ctx.drawImage(logoImage, x, y, logoSize, logoSize);
    }

    downloadBtn.disabled = false;
    downloadBtn.dataset.href = canvas.toDataURL('image/png');
  }, 60);
}

downloadBtn.addEventListener('click', () => {
  const href = downloadBtn.dataset.href;
  if (!href) return;
  const a = document.createElement('a');
  a.href = href;
  a.download = 'qrcode.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

document.getElementById('qr-generate').addEventListener('click', generate);
window.addEventListener('DOMContentLoaded', generate);
generate();
