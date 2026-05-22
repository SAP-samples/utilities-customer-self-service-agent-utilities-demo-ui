import express from 'express';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';

// ---------------------------------------------------------------------------
// Environment configuration loaded from process.env.
// In Docker, process.env is populated via docker-compose env_file (.env) and
// environment variables.
// ---------------------------------------------------------------------------
const {
  PORT = '3001',

  // IAS / OAuth2 settings
  IAS_URL,           // e.g. https://<tenant>.accounts.ondemand.com
  CLIENT_ID,         // OAuth2 client id
  CLIENT_SECRET,     // OAuth2 client secret
  IAS_RESOURCE,      // IAS application provider name (urn prefix added automatically)

  // Destination – the backend URL that the UI talks to
  DESTINATION_URL,   // e.g. https://<tenant>.ucssa.ai.cloud.sap

  // UI configuration served to the frontend
  FIRSTNAME = 'User',  // Display name shown in the UI header
  USERS = '[]',        // JSON array of user objects
} = process.env;

let users = [];
try {
  users = JSON.parse(USERS);
} catch {
  console.warn('[auth-backend] Failed to parse USERS env var – defaulting to empty list');
}

// Validate required vars at startup so the container fails fast
const REQUIRED = { IAS_URL, CLIENT_ID, CLIENT_SECRET, IAS_RESOURCE, DESTINATION_URL };
for (const [key, val] of Object.entries(REQUIRED)) {
  if (!val) {
    console.error(`[auth-backend] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// IAS token cache
// ---------------------------------------------------------------------------
let cachedToken = null;
let tokenExpiresAt = 0;

async function fetchIasToken() {
  console.log('[auth-backend] Fetching new IAS token …');
  const response = await axios.post(
    `${IAS_URL}/oauth2/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      resource: `urn:sap:identity:application:provider:name:${IAS_RESOURCE}`,
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return response.data;
}

async function getValidToken() {
  if (!cachedToken || Date.now() >= tokenExpiresAt) {
    const tokenData = await fetchIasToken();
    cachedToken = tokenData.access_token;
    // Refresh 60 s before actual expiry to avoid edge-cases
    tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;
  }
  return cachedToken;
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();
app.disable('x-powered-by');

// ------------------------------------------------------------------
// GET /health - readiness/liveness probe
// ------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ------------------------------------------------------------------
// GET /config – UI configuration (frontend user list)
// ------------------------------------------------------------------
app.get('/config', (_req, res) => {
  res.json({ firstname: FIRSTNAME, users });
});

// ------------------------------------------------------------------
// ALL /dssa/* – inject bearer token and proxy to destination
// ------------------------------------------------------------------
app.use(
  '/dssa',
  async (req, _res, next) => {
    try {
      const token = await getValidToken();
      req.headers['authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('[auth-backend] Failed to obtain IAS token:', err.message);
    }
    next();
  },
  createProxyMiddleware({
    target: DESTINATION_URL,
    changeOrigin: true,
    pathRewrite: { '^/dssa': '/' },
    // Keep SSE / streaming connections alive
    selfHandleResponse: false,
    on: {
      error(err, _req, res) {
        console.error('[auth-backend] Proxy error:', err.message);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Bad Gateway', message: err.message });
        }
      },
    },
  })
);

// ------------------------------------------------------------------
// Start server
// ------------------------------------------------------------------
app.listen(Number(PORT), () => {
  console.log(`[auth-backend] Listening on port ${PORT}`);
  console.log(`[auth-backend] Destination: ${DESTINATION_URL}`);
});
