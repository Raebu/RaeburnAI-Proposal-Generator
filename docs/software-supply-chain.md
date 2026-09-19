# Software supply-chain policy

RaeburnAI Proposal Generator treats dependency resolution, workflow definitions, production images and release evidence as security boundaries. These engineering controls do not by themselves establish certification or regulatory compliance.

## Dependency and workflow integrity

- `package-lock.json` is committed and CI/container builds use `npm ci`.
- `npm audit --audit-level=high` blocks High/Critical dependency findings.
- Every third-party GitHub Action must use a full 40-character commit SHA.
- `scripts/validate-supply-chain.mjs` scans the complete workflow estate and rejects missing dependency/image/release controls or multiple release-asset owners.

## Container integrity

- All Docker stages use the verified multi-platform `node:22.23.2-alpine3.24` OCI index `sha256:b6f26b36c8ff49624cfdac716b8ea1138d606df02586a77d364bb5536a634f85`.
- CI builds the production image with the exact Git commit SHA as its tag.
- Trivy blocks High/Critical findings.
- CI starts the built image and requires `/api/health` to report `status: ok`.
- The runtime strips npm/Corepack/package-manager frontends and runs as non-root.
- The image uses Node itself for its health check; no extra wget/curl package is installed solely for probing.

## Release trust evidence

`.github/workflows/release-trust.yml` is the sole owner of release trust assets. For an exact published tag it creates one deterministic `git archive | gzip -n` archive, isolated SPDX and CycloneDX SBOMs, one SHA-256 manifest, keyless Sigstore bundles, GitHub build provenance and both SBOM attestations. It verifies checksums, Sigstore bundles and the GitHub attestation before uploading the canonical trust package once.

`.github/workflows/sbom.yml` remains repository-SBOM-only and never uploads release assets. The former independent provenance/signing workflows are intentionally removed because separately recreated/clobbered archives can make signatures or attestations refer to different bytes.

**Real release evidence** requires execution against an actual release tag and inspection of the resulting published assets. Workflow source alone is Coded evidence.

## Remediation expectations

- **Critical:** release blocked immediately; triage/remediate as soon as practicable, normally within 24 hours. Any exception must be explicit, time-bounded, owned and documented with compensating controls.
- **High:** release blocked; remediate normally within 7 days or use the same governed exception process.
- **Medium/Low:** triage and schedule based on exploitability and impact.

Security gates are not weakened simply to make CI green.
