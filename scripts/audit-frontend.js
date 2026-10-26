#!/usr/bin/env node
/**
 * ============================================================================
 * ISLAND HOP FRONTEND - UNIFIED DETERMINISTIC AUDIT & VERIFICATION ENGINE
 * ============================================================================
 * One single, dynamic master engine to verify 100% of Frontend API integrations
 * against http://localhost:5003/api/v1 with zero assumptions in < 3 seconds.
 *
 * Usage:
 *   npm run audit              (Runs all suites: Public, Operator, Search)
 *   npm run audit -- --public   (Only public landing & popular journeys)
 *   npm run audit -- --operator (Only operator dashboard routes & lifecycle)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const fullPath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...v] = trimmed.split('=');
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}
loadEnv();

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1';
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || 'khaledahmednayeem.dev@gmail.com';
const OPERATOR_PASSWORD = process.env.OPERATOR_PASSWORD || 'Test@123';

const args = process.argv.slice(2);
const runAll = args.length === 0 || args.includes('--all');
const runPublic = runAll || args.includes('--public') || args.includes('--popular');
const runOperator = runAll || args.includes('--operator') || args.includes('--routes');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const check = `${colors.green}✔${colors.reset}`;
const cross = `${colors.red}✖${colors.reset}`;

async function http(endpoint, options = {}) {
  const start = Date.now();
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const duration = Date.now() - start;
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status: res.status, ok: res.ok, data, duration };
  } catch (err) {
    return { status: 0, ok: false, error: err.message, duration: Date.now() - start };
  }
}

async function runMasterAudit() {
  const startTime = Date.now();
  console.log('\n' + '='.repeat(78));
  console.log(`${colors.bold}${colors.cyan}⚓ ISLAND HOP FRONTEND: UNIFIED SYSTEM AUDIT ENGINE${colors.reset}`);
  console.log(`Backend Base: ${colors.yellow}${API_BASE}${colors.reset}`);
  console.log(`Modes Active: ${colors.green}${runPublic ? '[Public/Landing] ' : ''}${runOperator ? '[Operator Dashboard]' : ''}${colors.reset}`);
  console.log(`Started:      ${new Date().toISOString()}`);
  console.log('='.repeat(78) + '\n');

  let passed = 0;
  let total = 0;
  const suiteResults = [];

  // ==========================================================================
  // SUITE 1: PUBLIC & LANDING PAGE INTEGRATIONS
  // ==========================================================================
  if (runPublic) {
    console.log(`${colors.bold}📌 SUITE 1: Public Landing Page & Popular Journeys${colors.reset}`);

    // 1.1 Popular Routes
    total++;
    process.stdout.write(`  [1.1] GET /routes/popular (Showcase & Live Fares)... `);
    const popRes = await http('/routes/popular?limit=4');
    if (popRes.ok && popRes.data?.success && Array.isArray(popRes.data?.data) && popRes.data.data.length > 0) {
      passed++;
      const top = popRes.data.data[0];
      console.log(`${check} (${popRes.duration}ms)`);
      console.log(`        Loaded ${popRes.data.data.length} journeys | Top: ${colors.cyan}${top.from} ➔ ${top.to}${colors.reset} ($${top.startingPrice})`);
      suiteResults.push({ name: 'Popular Journeys API', status: 'PASS', ms: popRes.duration });
    } else {
      console.log(`${cross}`);
      suiteResults.push({ name: 'Popular Journeys API', status: 'FAIL', ms: popRes.duration });
    }

    // 1.2 Connected Ports
    total++;
    process.stdout.write(`  [1.2] GET /routes/ports (Connected Ports Map)... `);
    const portRes = await http('/routes/ports');
    if (portRes.ok && portRes.data?.success && Array.isArray(portRes.data?.data)) {
      passed++;
      console.log(`${check} (${portRes.duration}ms)`);
      console.log(`        Mapped ${portRes.data.data.length} active origin port hubs`);
      suiteResults.push({ name: 'Connected Ports API', status: 'PASS', ms: portRes.duration });
    } else {
      console.log(`${cross}`);
      suiteResults.push({ name: 'Connected Ports API', status: 'FAIL', ms: portRes.duration });
    }

    // 1.3 Trip Search for Popular Route
    total++;
    process.stdout.write(`  [1.3] GET /trips/search (Live Sailing Engine)... `);
    const today = new Date().toISOString().split('T')[0];
    const searchRes = await http(`/trips/search?from=Malé Ferry Terminal&to=Maafushi Jetty&departureDate=${today}&adults=1`);
    if (searchRes.ok && searchRes.data?.success) {
      passed++;
      const tripsCount = searchRes.data?.data?.outboundTrips?.length ?? 0;
      console.log(`${check} (${searchRes.duration}ms)`);
      console.log(`        Found ${tripsCount} bookable sailings for today (${today})`);
      suiteResults.push({ name: 'Live Trips Search Engine', status: 'PASS', ms: searchRes.duration });
    } else {
      console.log(`${cross}`);
      suiteResults.push({ name: 'Live Trips Search Engine', status: 'FAIL', ms: searchRes.duration });
    }

    console.log('');
  }

  // ==========================================================================
  // SUITE 2: OPERATOR DASHBOARD ROUTES & CRUD LIFECYCLE
  // ==========================================================================
  if (runOperator) {
    console.log(`${colors.bold}📌 SUITE 2: Operator Dashboard & Fleet Routes Management${colors.reset}`);

    // 2.1 Operator Auth
    total++;
    let token = '';
    process.stdout.write(`  [2.1] POST /auth/login (Operator Authentication)... `);
    const loginRes = await http('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: OPERATOR_EMAIL, password: OPERATOR_PASSWORD })
    });
    if (loginRes.ok && loginRes.data?.data?.accessToken) {
      token = loginRes.data.data.accessToken;
      passed++;
      console.log(`${check} (${loginRes.duration}ms)`);
      suiteResults.push({ name: 'Operator Login / JWT Auth', status: 'PASS', ms: loginRes.duration });
    } else {
      console.log(`${cross}`);
      suiteResults.push({ name: 'Operator Login / JWT Auth', status: 'FAIL', ms: loginRes.duration });
      console.error(`        Login failed: ${loginRes.data?.message || 'Unauthorized'}`);
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2.2 Ports Dropdown
    total++;
    let masterPorts = [];
    process.stdout.write(`  [2.2] GET /ports (Active Master Ports for Forms)... `);
    const portsRes = await http('/ports?limit=100&isActive=true', { headers: authHeaders });
    const pList = portsRes.data?.data?.data || portsRes.data?.data || [];
    if (portsRes.ok && Array.isArray(pList) && pList.length >= 2) {
      masterPorts = pList;
      passed++;
      console.log(`${check} (${portsRes.duration}ms)`);
      console.log(`        Loaded ${masterPorts.length} ports ready for dropdown selection`);
      suiteResults.push({ name: 'Ports Form Dropdowns', status: 'PASS', ms: portsRes.duration });
    } else {
      console.log(`${cross}`);
      suiteResults.push({ name: 'Ports Form Dropdowns', status: 'FAIL', ms: portsRes.duration });
    }

    // 2.3 Existing Routes List
    total++;
    process.stdout.write(`  [2.3] GET /routes (Operator Routes Listing & Tabs)... `);
    const routesRes = await http('/routes?limit=100', { headers: authHeaders });
    if (routesRes.ok && Array.isArray(routesRes.data?.data?.routes)) {
      passed++;
      console.log(`${check} (${routesRes.duration}ms)`);
      console.log(`        Loaded ${routesRes.data.data.routes.length} existing configured routes`);
      suiteResults.push({ name: 'Routes Table Listing', status: 'PASS', ms: routesRes.duration });
    } else {
      console.log(`${cross}`);
      suiteResults.push({ name: 'Routes Table Listing', status: 'FAIL', ms: routesRes.duration });
    }

    // 2.4 Lifecycle: Create -> Update -> Delete Route
    if (masterPorts.length >= 2) {
      total++;
      process.stdout.write(`  [2.4] Full Route Lifecycle (POST -> PATCH -> DELETE)... `);
      const existingRoutes = routesRes.data?.data?.routes || [];
      let portA = masterPorts[0];
      let portB = masterPorts[1];
      for (const p1 of masterPorts) {
        for (const p2 of masterPorts) {
          if (p1.id !== p2.id && !existingRoutes.some(r => r.departurePortId === p1.id && r.destinationPortId === p2.id)) {
            portA = p1;
            portB = p2;
            break;
          }
        }
        if (portA !== masterPorts[0] || portB !== masterPorts[1]) break;
      }

      // Create with Option 2 Rich Data (basePrice, amenities, description)
      const createRes = await http('/routes', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          departurePortId: portA.id,
          destinationPortId: portB.id,
          durationMinutes: 55,
          isBorderCrossing: false,
          status: 'ACTIVE',
          basePrice: 45,
          amenities: ['Air Conditioned', 'Free 20kg Bag'],
          description: 'Scenic island crossing with premium amenities'
        })
      });

      const routeId = createRes.data?.data?.id;
      const createdData = createRes.data?.data;
      const richDataPreserved = createdData?.basePrice === 45 && Array.isArray(createdData?.amenities) && createdData.amenities.includes('Air Conditioned');

      if (createRes.ok && routeId && richDataPreserved) {
        // Update
        const updateRes = await http(`/routes/${routeId}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            durationMinutes: 70,
            status: 'INACTIVE',
            isBorderCrossing: false,
            basePrice: 50,
            amenities: ['Air Conditioned', 'Fast Speedboat', 'Surfboard Allowed']
          })
        });

        // Delete
        const delRes = await http(`/routes/${routeId}`, {
          method: 'DELETE',
          headers: authHeaders
        });

        if (updateRes.ok && delRes.ok) {
          passed++;
          const cycleDuration = createRes.duration + updateRes.duration + delRes.duration;
          console.log(`${check} (${cycleDuration}ms)`);
          console.log(`        Created (${portA.name} ➔ ${portB.name}) with Base Price $45 & Amenities, updated, and cleaned up.`);
          suiteResults.push({ name: 'Route Lifecycle CRUD (Option 2)', status: 'PASS', ms: cycleDuration });
        } else {
          console.log(`${cross} Update/Delete failed`);
          suiteResults.push({ name: 'Route Lifecycle CRUD (Option 2)', status: 'FAIL', ms: 0 });
        }
      } else {
        console.log(`${cross} Creation failed or rich data mismatch (basePrice: ${createdData?.basePrice})`);
        suiteResults.push({ name: 'Route Lifecycle CRUD (Option 2)', status: 'FAIL', ms: 0 });
      }
    }

    console.log('');
  }

  // ==========================================================================
  // FINAL EXECUTIVE REPORT
  // ==========================================================================
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const is100Percent = passed === total && total > 0;

  console.log('='.repeat(78));
  if (is100Percent) {
    console.log(`${colors.bold}${colors.green}🎉 AUDIT RESULT: 100% PASS (${passed}/${total} TESTS) IN ${totalDuration}s${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}❌ AUDIT RESULT: SOME TESTS FAILED (${passed}/${total} PASSED) IN ${totalDuration}s${colors.reset}`);
  }
  console.log('='.repeat(78));

  console.log('\nIntegration Status Matrix:');
  suiteResults.forEach((s) => {
    const icon = s.status === 'PASS' ? check : cross;
    console.log(`  ${icon} ${s.name.padEnd(32)} [${s.status}] (${s.ms}ms)`);
  });
  console.log('\n');

  if (!is100Percent) process.exit(1);
}

runMasterAudit().catch((err) => {
  console.error('\nFatal Audit Engine Failure:', err);
  process.exit(1);
});
