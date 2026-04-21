/**
 * Import / re-sync leads from the live Google Sheet.
 *
 * Requires:
 *   GOOGLE_SERVICE_ACCOUNT_JSON_B64  (base64 of service-account JSON)
 *   SHEET_ID                         (default: Stonnex Master Lead CRM)
 *   SHEET_TAB                        (default: "Master Lead CRM")
 *
 * Run with:
 *   npm run import:sheet
 *
 * It upserts by the STX-### value in column A. Rows without an STX id
 * are skipped (they're test / webhook-injected rows that haven't been
 * numbered yet).
 */
import { PrismaClient } from '@prisma/client';
import { normalizeSource, normalizeStatus } from '../src/lib/utils';

const prisma = new PrismaClient();

async function fetchRows(): Promise<string[][]> {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64;
  if (!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_B64 not set');
  const sheetId = process.env.SHEET_ID;
  if (!sheetId) throw new Error('SHEET_ID not set');
  const tab = process.env.SHEET_TAB ?? 'Master Lead CRM';

  const creds = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  // Inline JWT-based Google OAuth (no extra dep).
  const token = await getAccessToken(creds);

  const range = encodeURIComponent(`${tab}!A4:O500`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { values?: string[][] };
  return json.values ?? [];
}

async function getAccessToken(creds: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const { createSign } = await import('node:crypto');
  const b64url = (s: string | Buffer) =>
    Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const input = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(input);
  const sig = signer.sign(creds.private_key).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const assertion = `${input}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as { access_token: string };
  return j.access_token;
}

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v.replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function parseDate(s: string | undefined): Date {
  if (!s) return new Date();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

async function main() {
  const rows = await fetchRows();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Expected columns (0-based):
  //   0 # (STX-###) | 1 DATE | 2 SOURCE | 3 (hidden) | 4 FULL NAME
  //   5 PHONE | 6 EMAIL | 7 ADDRESS | 8 CITY | 9 SERVICE
  //   10 EST SQ FT | 11 QUOTE | 12 STATUS | 13 ASSIGNED TO | 14 FOLLOW-UP
  for (const row of rows) {
    const externalId = row[0]?.trim();
    if (!externalId || !/^STX-\d+/i.test(externalId)) {
      skipped++;
      continue;
    }

    const data = {
      externalId,
      receivedAt: parseDate(row[1]),
      source: normalizeSource(row[2]),
      fullName: row[4]?.trim() || null,
      phone: row[5]?.trim() || null,
      email: row[6]?.trim() || null,
      address: row[7]?.trim() || null,
      city: row[8]?.trim() || null,
      service: row[9]?.trim() || null,
      estSqFt: num(row[10]) ?? null,
      quote: num(row[11]) ?? null,
      status: normalizeStatus(row[12]),
      assignedTo: row[13]?.trim() || null,
    };

    const existing = await prisma.lead.findUnique({ where: { externalId } });
    if (existing) {
      await prisma.lead.update({ where: { externalId }, data });
      updated++;
    } else {
      await prisma.lead.create({ data });
      created++;
    }
  }

  console.log(`✓ created ${created}, updated ${updated}, skipped ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
