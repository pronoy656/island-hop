#!/usr/bin/env node
/**
 * ============================================================================
 * ISLAND HOP - POPULAR JOURNEYS DETERMINISTIC VERIFICATION SCRIPT
 * ============================================================================
 * Zero-assumption, 100% accurate, live verification of the Popular Journeys API
 * at http://localhost:5003/api/v1/routes/popular and its data integrity.
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

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const checkmark = `${colors.green}✔${colors.reset}`;
const crossmark = `${colors.red}✖${colors.reset}`;

async function request(endpoint) {
  const start = Date.now();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
  });
  const duration = Date.now() - start;
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data, duration };
}

async function run() {
  console.log('\n' + '='.repeat(75));
  console.log(`${colors.bold}${colors.cyan}⚓ ISLAND HOP: POPULAR JOURNEYS PUBLIC API VERIFICATION${colors.reset}`);
  console.log(`Base URL:     ${colors.yellow}${API_BASE}${colors.reset}`);
  console.log(`Endpoint:     ${colors.yellow}${API_BASE}/routes/popular${colors.reset}`);
  console.log(`Started At:   ${new Date().toISOString()}`);
  console.log('='.repeat(75) + '\n');

  let passed = 0;
  const total = 4;

  // TEST 1: Public endpoint without auth
  process.stdout.write(`[1/${total}] Checking public access without auth (GET /routes/popular)... `);
  const res1 = await request('/routes/popular');
  if (res1.ok && res1.data?.success && Array.isArray(res1.data?.data)) {
    passed++;
    console.log(`${checkmark} (${res1.duration}ms)`);
    console.log(`      Received: ${colors.green}${res1.data.data.length} popular routes${colors.reset}`);
  } else {
    console.log(`${crossmark}`);
    console.error(`      Failed with status ${res1.status}:`, res1.data);
    process.exit(1);
  }

  // TEST 2: Validate payload fields for Frontend UI
  process.stdout.write(`[2/${total}] Validating UI schema fields (from, to, startingPrice, duration, tag)... `);
  const sample = res1.data.data[0];
  const requiredFields = ['from', 'to', 'startingPrice', 'duration', 'tag', 'rating', 'highlights'];
  const missing = requiredFields.filter((f) => sample[f] === undefined);

  if (missing.length === 0) {
    passed++;
    console.log(`${checkmark}`);
    console.log(`      Sample: ${colors.cyan}${sample.from} ➔ ${sample.to}${colors.reset} | Fare: $${sample.startingPrice} | Rating: ${sample.rating} ⭐`);
  } else {
    console.log(`${crossmark}`);
    console.error(`      Missing expected fields: ${missing.join(', ')}`);
    process.exit(1);
  }

  // TEST 3: Limit parameter check
  process.stdout.write(`[3/${total}] Verifying query param ?limit=2 (GET /routes/popular?limit=2)... `);
  const res3 = await request('/routes/popular?limit=2');
  if (res3.ok && res3.data?.data?.length === 2) {
    passed++;
    console.log(`${checkmark} (${res3.duration}ms)`);
    console.log(`      Returned exactly 2 items as requested.`);
  } else {
    console.log(`${crossmark}`);
    console.error(`      Expected 2 items, got: ${res3.data?.data?.length}`);
    process.exit(1);
  }

  // TEST 4: Live Search Connectivity
  const today = new Date().toISOString().split('T')[0];
  process.stdout.write(`[4/${total}] Verifying Live Trip Search for popular route 1 (GET /trips/search)... `);
  const searchUrl = `/trips/search?from=${encodeURIComponent(sample.from)}&to=${encodeURIComponent(sample.to)}&departureDate=${today}&adults=1`;
  const res4 = await request(searchUrl);
  if (res4.ok && res4.data?.success) {
    passed++;
    console.log(`${checkmark} (${res4.duration}ms)`);
    console.log(`      Trip Search connected: ${res4.data.message || 'Success'}`);
  } else {
    console.log(`${crossmark}`);
    console.error(`      Search failed with status ${res4.status}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(75));
  console.log(`${colors.bold}${colors.green}🎉 ALL ${passed}/${total} POPULAR JOURNEYS TESTS PASSED (100% READY)${colors.reset}`);
  console.log('='.repeat(75) + '\n');
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
