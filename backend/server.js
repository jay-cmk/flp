const path = require('path');
const fs = require('fs');
const localEnvPath = fs.existsSync(path.join(__dirname, '.env'))
    ? path.join(__dirname, '.env')
    : path.join(__dirname, 'config', 'config.env');
require('dotenv').config({ path: localEnvPath });

const cloudinary = require('cloudinary');
const app = require('./app');
const connectDatabase = require('./config/database');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const startServer = async () => {
    await connectDatabase();

    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Backend listening on port ${port}`);
    });

    server.on('error', (error) => {
        console.error(`Backend server failed to listen: ${error.message}`);
        process.exitCode = 1;
    });

    return server;
};

if (require.main === module) {
    startServer().catch((error) => {
        console.error(`Backend startup failed: ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = startServer;
