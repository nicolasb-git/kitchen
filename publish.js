require('dotenv').config();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log('Connecting to FTP server...');
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log('Connected! Starting upload...');

        // Change to remote directory
        if (process.env.FTP_REMOTE_ROOT) {
            await client.ensureDir(process.env.FTP_REMOTE_ROOT);
            await client.cd(process.env.FTP_REMOTE_ROOT);
            console.log(`Changed to remote directory: ${process.env.FTP_REMOTE_ROOT}`);
        }

        // Upload individual files
        console.log('\nUploading main files...');
        const filesToUpload = ['index.html', 'styles.css', 'script.js', 'recipes.js'];
        for (const file of filesToUpload) {
            console.log(`Uploading ${file}...`);
            await client.uploadFrom(file, file);
        }

        // Upload images
        console.log('\nUploading images...');

        // Try to create images directory, ignore if it exists
        try {
            await client.send('MKD images');
        } catch (err) {
            // Directory might already exist, that's ok
            console.log('Images directory already exists or created');
        }

        await client.cd('images');

        const imagesDir = 'images';
        const imageFiles = fs.readdirSync(imagesDir).filter(f => {
            const ext = path.extname(f).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        console.log(`Found ${imageFiles.length} images to upload`);

        for (const imageFile of imageFiles) {
            const localPath = path.join(imagesDir, imageFile);
            console.log(`Uploading ${imageFile}...`);
            await client.uploadFrom(localPath, imageFile);
        }

        await client.cd('..');

        // Upload recipes directory
        console.log('\nUploading recipe pages...');
        await client.uploadFromDir('recipes', 'recipes');
        console.log('Recipe pages uploaded!');

        // Upload sitemap and robots.txt
        console.log('\nUploading SEO files...');
        await client.uploadFrom('sitemap.xml', 'sitemap.xml');
        await client.uploadFrom('robots.txt', 'robots.txt');

        console.log('\nDeployment complete!');
    } catch (err) {
        console.error('Deployment failed:', err);
    } finally {
        client.close();
    }
}

deploy();
