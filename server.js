const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic authentication middleware
function basicAuth(req, res, next) {
    const auth = req.headers.authorization;
    
    if (!auth || !auth.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Homelab Dashboard"');
        return res.status(401).send('Authentication required');
    }
    
    const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];
    
    // Check credentials (set these in your .env file)
    const validUsername = process.env.DASHBOARD_USERNAME || 'admin';
    const validPassword = process.env.DASHBOARD_PASSWORD || 'homelab';
    
    // Add rate limiting - block IP after 3 failed attempts
    if (!req.session) req.session = {};
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!global.failedAttempts) global.failedAttempts = {};
    
    if (global.failedAttempts[clientIP] >= 3) {
        return res.status(429).send('Too many failed attempts. Access blocked.');
    }
    
    if (username === validUsername && password === validPassword) {
        // Reset failed attempts on successful login
        if (global.failedAttempts[clientIP]) {
            delete global.failedAttempts[clientIP];
        }
        next();
    } else {
        // Track failed attempts
        global.failedAttempts[clientIP] = (global.failedAttempts[clientIP] || 0) + 1;
        console.log(`Failed login attempt from ${clientIP}. Attempts: ${global.failedAttempts[clientIP]}`);
        
        res.setHeader('WWW-Authenticate', 'Basic realm="Homelab Dashboard"');
        return res.status(401).send('Invalid credentials');
    }
}

// Apply authentication to all routes
app.use(basicAuth);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Simple API endpoint for dashboard info
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        services: 2,
        server: 'mac-ubuntu',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptimeKumaConfigured: !!process.env.UPTIME_KUMA_API_KEY
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Homelab Dashboard server running on http://localhost:${PORT}`);
    console.log(`📊 Uptime Kuma URL: ${process.env.UPTIME_KUMA_URL}`);
    console.log(`🔑 API Key configured: ${process.env.UPTIME_KUMA_API_KEY ? 'Yes' : 'No'}`);
});
