const fs = require('fs');
const path = require('path');
const https = require('https');

// Odczytaj plik HTML
const htmlPath = 'c:\\Users\\Damian\\Desktop\\Spis lego statek.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// Wyekstraktuj wszystkie URL-e CDN
const regex = /large-preview[^>]*><img src="(https:\/\/cdn\.rebrickable\.com\/[^"]+)"/g;
const urls = [];
let match;
while ((match = regex.exec(html)) !== null) {
  urls.push(match[1]);
}

const uniqueUrls = [...new Set(urls)];
console.log(`Znaleziono ${uniqueUrls.length} unikalnych obrazków do pobrania`);

// Utwórz folder dla dużych obrazków
const largeImagesDir = path.join(__dirname, 'public', 'ISD_Monarch_elements_large');
if (!fs.existsSync(largeImagesDir)) {
  fs.mkdirSync(largeImagesDir, { recursive: true });
}

// Funkcja do pobrania obrazka
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else {
          fs.unlink(filepath, () => {});
          reject(new Error(`Failed to download: ${response.statusCode}`));
        }
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

// Pobierz wszystkie obrazki
async function downloadAll() {
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    // Wyekstraktuj nazwę pliku z URL
    const urlParts = url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 2]; // np. "4215513.jpg" lub "604552.png"
    const filepath = path.join(largeImagesDir, filenameWithExt);

    try {
      console.log(`Pobieranie ${i + 1}/${uniqueUrls.length}: ${filenameWithExt}`);
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`Błąd pobierania ${filenameWithExt}: ${error.message}`);
    }
  }
  console.log('Zakończono pobieranie!');
}

downloadAll();
