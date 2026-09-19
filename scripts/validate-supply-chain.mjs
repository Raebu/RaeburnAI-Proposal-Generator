import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const workflowDir = path.join(root, '.github', 'workflows');
const sha40 = /^[0-9a-f]{40}$/i;
const usesPattern = /^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm;
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(relativePath + ' is required');
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function requireMarker(source, relativePath, description, marker) {
  if (!source.includes(marker)) failures.push(relativePath + ' is missing ' + description + ': ' + marker);
}

const workflowFiles = fs.readdirSync(workflowDir)
  .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
  .sort();

const workflowSources = new Map();
for (const workflowFile of workflowFiles) {
  const relativePath = '.github/workflows/' + workflowFile;
  const source = read(relativePath);
  workflowSources.set(relativePath, source);
  usesPattern.lastIndex = 0;
  for (const match of source.matchAll(usesPattern)) {
    const reference = match[1];
    if (reference.startsWith('./') || reference.startsWith('docker://')) continue;
    const separator = reference.lastIndexOf('@');
    const ref = separator >= 0 ? reference.slice(separator + 1) : '';
    if (!sha40.test(ref)) failures.push(relativePath + ' must pin third-party action to a 40-character commit SHA: ' + reference);
  }
}

read('package-lock.json');

const ciSource = read('.github/workflows/ci.yml');
requireMarker(ciSource, '.github/workflows/ci.yml', 'deterministic npm install', 'npm ci');
requireMarker(ciSource, '.github/workflows/ci.yml', 'supply-chain validator', 'npm run validate:supply-chain');
requireMarker(ciSource, '.github/workflows/ci.yml', 'High/Critical dependency audit', 'npm audit --audit-level=high');
requireMarker(ciSource, '.github/workflows/ci.yml', 'Trivy image gate', 'aquasecurity/trivy-action@');
requireMarker(ciSource, '.github/workflows/ci.yml', 'live health smoke test', '/api/health');
requireMarker(ciSource, '.github/workflows/ci.yml', 'exact-SHA image identity', 'raeburnai-proposal-generator:${{ github.sha }}');

const dockerfileSource = read('Dockerfile');
if (!/^FROM\s+[^\s]+@sha256:[0-9a-f]{64}/m.test(dockerfileSource)) failures.push('Dockerfile must pin the Node base by sha256 digest');
requireMarker(dockerfileSource, 'Dockerfile', 'deterministic npm install', 'npm ci');
requireMarker(dockerfileSource, 'Dockerfile', 'direct Node runtime entrypoint', 'CMD ["node", "server.js"]');
if (dockerfileSource.includes('apk add --no-cache wget')) failures.push('Dockerfile must not add wget only for health checks');

for (const legacy of ['.github/workflows/provenance.yml', '.github/workflows/release-signing.yml']) {
  if (fs.existsSync(path.join(root, legacy))) failures.push(legacy + ' must be removed; release assets require one canonical owner');
}

const releasePath='.github/workflows/release-trust.yml';
const releaseSource=read(releasePath);
requireMarker(releaseSource, releasePath, 'published release trigger', 'types: [published]');
requireMarker(releaseSource, releasePath, 'reusable release exercise entrypoint', 'workflow_call:');
requireMarker(releaseSource, releasePath, 'deterministic archive', 'git archive --format=tar');
requireMarker(releaseSource, releasePath, 'normalized gzip metadata', 'gzip -n');
requireMarker(releaseSource, releasePath, 'SPDX SBOM', 'spdx-json');
requireMarker(releaseSource, releasePath, 'CycloneDX SBOM', 'cyclonedx-json');
requireMarker(releaseSource, releasePath, 'checksum manifest', 'SHA256SUMS');
requireMarker(releaseSource, releasePath, 'keyless signing', 'cosign sign-blob');
requireMarker(releaseSource, releasePath, 'Sigstore verification', 'cosign verify-blob');
requireMarker(releaseSource, releasePath, 'GitHub attestation', 'actions/attest@');
requireMarker(releaseSource, releasePath, 'GitHub attestation verification', 'gh attestation verify');
requireMarker(releaseSource, releasePath, 'single release upload', 'gh release upload');
const releaseUploadCount = (releaseSource.match(/gh release upload/g) || []).length;
if (releaseUploadCount !== 1) failures.push(releasePath + ' must contain exactly one gh release upload command; found ' + releaseUploadCount);

const owners=[];
for (const [relativePath, source] of workflowSources.entries()) {
  if (source.includes('gh release upload') || /upload-release-assets:\s*true/.test(source)) owners.push(relativePath);
}
if (owners.length !== 1 || owners[0] !== releasePath) {
  failures.push('release assets must have exactly one canonical workflow owner (' + releasePath + '); found: ' + (owners.join(', ') || 'none'));
}

const sbomSource=read('.github/workflows/sbom.yml');
requireMarker(sbomSource, '.github/workflows/sbom.yml', 'release upload disabled', 'upload-release-assets: false');
if (/\brelease:\s*\n\s*types:\s*\[published\]/.test(sbomSource)) failures.push('.github/workflows/sbom.yml must not own release-event packaging');

const policy=read('docs/software-supply-chain.md');
requireMarker(policy, 'docs/software-supply-chain.md', 'Critical remediation expectation', '**Critical:**');
requireMarker(policy, 'docs/software-supply-chain.md', 'High remediation expectation', '**High:**');
requireMarker(policy, 'docs/software-supply-chain.md', 'release evidence boundary', 'Real release evidence');

if (failures.length) {
  console.error('Software supply-chain policy validation failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.warn('Software supply-chain policy validated: ' + workflowFiles.length + ' workflows use immutable action refs; dependency/image gates, minimized runtime and one canonical release trust owner are present.');
