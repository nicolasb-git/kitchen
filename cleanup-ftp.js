require('dotenv').config();
const ftp = require('basic-ftp');

async function cleanup() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        // Navigate to kitchen directory
        await client.cd('/home/kaerith/www/kitchen/images');

        // Remove the nested images directory
        console.log('Removing nested images directory...');
        await client.removeDir('images');

        console.log('Cleanup complete!');
    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        client.close();
    }
}

cleanup();
