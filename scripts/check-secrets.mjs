import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
  ['OpenAI project key', /\bsk-proj-[A-Za-z0-9_-]{40,}\b/],
  ['Stripe live secret', /\bsk_live_[A-Za-z0-9]{20,}\b/],
];
const binaryExtensions = new Set(['.gif', '.ico', '.jpeg', '.jpg', '.pdf', '.png', '.webp', '.woff', '.woff2', '.zip']);
const files = execFileSync('git', ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean);
const findings = [];

for (const file of files) {
  if (binaryExtensions.has(extname(file).toLowerCase())) continue;
  try {
    if (!statSync(file).isFile()) continue;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const [label, pattern] of patterns) {
        if (pattern.test(line)) findings.push(`${file}:${index + 1}: possible ${label}`);
      }
    });
  } catch {
    // Dedicated binary scanners remain an external release gate.
  }
}

if (findings.length) {
  console.error('High-confidence tracked-secret patterns found:\n' + findings.join('\n'));
  process.exit(1);
}
console.log('No high-confidence tracked-secret patterns found.');
