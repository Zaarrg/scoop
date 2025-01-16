const fs = require('fs');
const path = require('path');
const https = require('https');

// List of JSON manifest URLs:
const manifestUrls = [
    'https://raw.githubusercontent.com/Zaarrg/stremio-desktop-v5/refs/heads/webview-windows/utils/scoop/stremio-desktop-v5.json'

];

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);

        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Request failed with status code ${res.statusCode} for URL ${url}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlinkSync(destPath); // cleanup partial file
            reject(err);
        });
    });
}

(async function main() {
    try {
        const bucketDir = path.join(__dirname, 'bucket');
        // Ensure bucket/ folder exists
        if (!fs.existsSync(bucketDir)) {
            fs.mkdirSync(bucketDir, { recursive: true });
        }

        for (const url of manifestUrls) {
            const filename = path.basename(url);
            const destPath = path.join(bucketDir, filename);

            console.log(`Downloading ${url}...`);
            await downloadFile(url, destPath);
            console.log(`Saved to: ${destPath}`);
        }

        console.log('\nAll manifests downloaded successfully.\n');
    } catch (err) {
        console.error('Error in sync.js:', err);
        process.exit(1);
    }
})();
