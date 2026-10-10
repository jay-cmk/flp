const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
const errorMiddleware = require('./middlewares/error');

const app = express();

// config
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const parseFrontendOrigins = (value) => value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
        let url;
        try {
            url = new URL(entry);
        } catch (error) {
            throw new Error('FRONTEND_URL must contain comma-separated frontend origins');
        }

        if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
            throw new Error('FRONTEND_URL entries must be HTTP(S) origins without paths or credentials');
        }

        return url.origin;
    });

const configuredOrigins = parseFrontendOrigins(process.env.FRONTEND_URL || '');
if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
    throw new Error('FRONTEND_URL must configure at least one frontend origin in production');
}

const allowedOrigins = configuredOrigins.length
    ? configuredOrigins
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

if (process.env.NODE_ENV !== 'production') {
    // CRA rewrites the proxied Origin to its backend target, including a trailing slash.
    allowedOrigins.push('http://localhost:4000/', 'http://127.0.0.1:4000/');
}

app.use((req, res, next) => {
    const origin = req.get('origin');
    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

    if (!isAllowedOrigin) {
        res.setHeader('Vary', 'Origin');
        return res.status(403).json({
            success: false,
            message: 'Origin is not allowed. Configure this exact frontend origin in FRONTEND_URL.',
            origin,
        });
    }

    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
}));

app.get('/', (req, res) => {
    res.send('Server is Running! 🚀');
});

app.get('/health', (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;
    res.status(isDatabaseConnected ? 200 : 503).json({
        status: isDatabaseConnected ? 'ok' : 'unavailable',
        database: isDatabaseConnected ? 'connected' : 'disconnected',
    });
});

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');

app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);

// error middleware
app.use(errorMiddleware);

module.exports = app;