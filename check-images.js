require('dotenv').config();
const ftp = require('basic-ftp');

async function checkImages() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log('\n=== /www/kitchen/images ===');
        const files = await client.list('/www/kitchen/images');
        console.log(files);

        if (files.length > 0) {
            console.log('\nFiles found:');
            files.forEach(f => console.log(`- ${f.name} (${f.type === 1 ? 'file' : 'dir'})`));
        } else {
            console.log('\nDirectory is empty!');
        }

    } catch (err) {
        console.error('Failed:', err);
    } finally {
        client.close();
    }
}

checkImages();
