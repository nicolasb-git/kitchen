require('dotenv').config();
const ftp = require('basic-ftp');

async function listRemote() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log('\n=== ROOT DIRECTORY ===');
        console.log(await client.list('/'));

        console.log('\n=== /home/kaerith/www/kitchen ===');
        console.log(await client.list('/home/kaerith/www/kitchen'));

        console.log('\n=== /home/kaerith/www/kitchen/images ===');
        console.log(await client.list('/home/kaerith/www/kitchen/images'));

    } catch (err) {
        console.error('Failed:', err);
    } finally {
        client.close();
    }
}

listRemote();
