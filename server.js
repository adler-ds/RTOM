/**
 * Salesforce Personalization Services – Decisioning API
 * @see https://developer.salesforce.com/docs/marketing/einstein-personalization/guide/decisioning-api-reference.html
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

const PERSONALIZATION_CONFIG = {
  baseUrl: (process.env.PERSONALIZATION_BASE_URL || '').replace(/\/$/, ''),
  accessToken: process.env.PERSONALIZATION_ACCESS_TOKEN || ''
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function callPersonalizationApi(requestBody) {
  return new Promise((resolve, reject) => {
    if (!PERSONALIZATION_CONFIG.baseUrl || !PERSONALIZATION_CONFIG.accessToken) {
      reject(new Error('PERSONALIZATION_BASE_URL and PERSONALIZATION_ACCESS_TOKEN must be set in .env'));
      return;
    }
    const url = new URL('/personalization/decisions', PERSONALIZATION_CONFIG.baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const body = JSON.stringify(requestBody);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERSONALIZATION_CONFIG.accessToken}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(parsed.message || parsed.description || data || `HTTP ${res.statusCode}`));
        } catch (e) {
          reject(new Error(data || e.message));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Salesforce Personalization',
    configured: !!(PERSONALIZATION_CONFIG.baseUrl && PERSONALIZATION_CONFIG.accessToken),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/personalization/decisions', async (req, res) => {
  try {
    const { context, personalizationPoints, profile, executionFlags } = req.body;
    if (!context || !personalizationPoints || !Array.isArray(personalizationPoints)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must include context and personalizationPoints (array)'
      });
    }
    const requestBody = {
      context: { ...context },
      personalizationPoints: personalizationPoints.map(pt => ({ id: pt.id, name: pt.name, decisionId: pt.decisionId })),
      ...(profile && { profile }),
      ...(executionFlags && executionFlags.length && { executionFlags })
    };
    const result = await callPersonalizationApi(requestBody);
    res.json({
      success: true,
      requestId: result.requestId,
      personalizations: result.personalizations || [],
      diagnostics: result.diagnostics
    });
  } catch (error) {
    console.error('Personalization API error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/personalization/request', async (req, res) => {
  try {
    const { individualId, dataspace, personalizationPointName, personalizationPointId, anchorId, anchorType, requestUrl, enableDiagnostics } = req.body;
    if (!individualId || !dataspace) {
      return res.status(400).json({ success: false, error: 'individualId and dataspace are required' });
    }
    const point = {};
    if (personalizationPointId) point.id = personalizationPointId;
    if (personalizationPointName) point.name = personalizationPointName;
    if (Object.keys(point).length === 0) {
      return res.status(400).json({ success: false, error: 'Provide personalizationPointName or personalizationPointId' });
    }
    const requestBody = {
      context: { individualId, dataspace, ...(anchorId && { anchorId }), ...(anchorType && { anchorType }), ...(requestUrl && { requestUrl }) },
      personalizationPoints: [point],
      ...(enableDiagnostics && { executionFlags: ['EnableDiagnostics'] })
    };
    const result = await callPersonalizationApi(requestBody);
    res.json({
      success: true,
      requestId: result.requestId,
      personalizations: result.personalizations || [],
      diagnostics: result.diagnostics
    });
  } catch (error) {
    console.error('Personalization request error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/test-site', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-site.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('\nSalesforce Personalization – Decisioning API');
  console.log(`Server: http://localhost:${PORT}`);
  if (!PERSONALIZATION_CONFIG.baseUrl || !PERSONALIZATION_CONFIG.accessToken) {
    console.warn('Set PERSONALIZATION_BASE_URL and PERSONALIZATION_ACCESS_TOKEN in .env');
  }
});

module.exports = app;
