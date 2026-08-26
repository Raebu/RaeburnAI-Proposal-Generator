#!/usr/bin/env python3
"""Passive certificate-transparency monitor for Raeburn public domains.

Primary source: Cert Spotter CT Search API. Fallback: crt.sh. The monitor compares
certificate IDs against a committed snapshot and emits GitHub Actions outputs
for newly observed certificates. CT information is public; no secrets or
private infrastructure are queried.
"""

from __future__ import annotations

import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DOMAINS = ("theraeburngroup.com", "caringcrewco.com")
SNAPSHOT = pathlib.Path("security/certificate-transparency/ct-snapshot.json")
NEW_RECORDS = pathlib.Path("security/certificate-transparency/new-certificates.json")
USER_AGENT = "Raeburn-CT-Monitor/1.1 (+https://theraeburngroup.com)"


def request_json(url: str) -> object:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=35) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < 3:
                time.sleep(2**attempt)
    raise RuntimeError(f"request failed after retries: {url}: {last_error}")


def fetch_certspotter(domain: str) -> list[dict]:
    records: list[dict] = []
    after: str | None = None
    for _ in range(200):
        params: list[tuple[str, str]] = [
            ("domain", domain),
            ("include_subdomains", "true"),
            ("expand", "dns_names"),
            ("expand", "issuer"),
        ]
        if after:
            params.append(("after", after))
        url = "https://api.certspotter.com/v1/issuances?" + urllib.parse.urlencode(params)
        data = request_json(url)
        if not isinstance(data, list):
            raise ValueError("Unexpected Cert Spotter response shape")
        if not data:
            break
        records.extend(item for item in data if isinstance(item, dict))
        last_id = data[-1].get("id")
        if last_id is None:
            raise ValueError("Cert Spotter response missing issuance id")
        new_after = str(last_id)
        if new_after == after:
            break
        after = new_after
    return records


def fetch_crtsh(domain: str) -> list[dict]:
    query = urllib.parse.quote(f"%.{domain}", safe="")
    data = request_json(f"https://crt.sh/?q={query}&output=json")
    if not isinstance(data, list):
        raise ValueError("Unexpected crt.sh response shape")
    return [item for item in data if isinstance(item, dict)]


def fetch_domain(domain: str) -> tuple[str, list[dict]]:
    errors: list[str] = []
    try:
        return "certspotter", fetch_certspotter(domain)
    except Exception as exc:
        errors.append(f"Cert Spotter: {exc}")
    try:
        return "crt.sh", fetch_crtsh(domain)
    except Exception as exc:
        errors.append(f"crt.sh: {exc}")
    raise RuntimeError(f"All CT providers failed for {domain}: {' | '.join(errors)}")


def normalize_certspotter(domain: str, row: dict) -> dict:
    issuer = row.get("issuer")
    if isinstance(issuer, dict):
        issuer_name = str(issuer.get("name") or issuer.get("friendly_name") or issuer)
    else:
        issuer_name = str(issuer or "")
    names = sorted({str(name).strip().lower() for name in row.get("dns_names", []) if str(name).strip()})
    return {
        "domain": domain,
        "id": str(row.get("id", "")),
        "issuer_name": issuer_name,
        "common_name": "",
        "names": names,
        "not_before": str(row.get("not_before", "")),
        "not_after": str(row.get("not_after", "")),
        "entry_timestamp": str(row.get("tbs_sha256", "")),
        "serial_number": str(row.get("cert_sha256", "")),
        "source": "certspotter",
    }


def normalize_crtsh(domain: str, row: dict) -> dict:
    names = sorted({name.strip().lower() for name in str(row.get("name_value", "")).splitlines() if name.strip()})
    return {
        "domain": domain,
        "id": str(row.get("id", "")),
        "issuer_name": str(row.get("issuer_name", "")),
        "common_name": str(row.get("common_name", "")),
        "names": names,
        "not_before": str(row.get("not_before", "")),
        "not_after": str(row.get("not_after", "")),
        "entry_timestamp": str(row.get("entry_timestamp", "")),
        "serial_number": str(row.get("serial_number", "")),
        "source": "crt.sh",
    }


def collect() -> list[dict]:
    records: dict[tuple[str, str, str], dict] = {}
    for domain in DOMAINS:
        source, rows = fetch_domain(domain)
        print(f"CT source for {domain}: {source} ({len(rows)} rows)")
        for raw in rows:
            record = normalize_certspotter(domain, raw) if source == "certspotter" else normalize_crtsh(domain, raw)
            if record["id"]:
                key = (domain, source, record["id"])
                records[key] = record
    return sorted(records.values(), key=lambda item: (item["domain"], item["source"], item["id"]))


def load_snapshot() -> list[dict]:
    if not SNAPSHOT.exists():
        return []
    payload = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    return payload.get("certificates", []) if isinstance(payload, dict) else []


def save_json(path: pathlib.Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"domains": list(DOMAINS), "certificates": records}
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_output(name: str, value: str) -> None:
    output_file = os.getenv("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a", encoding="utf-8") as handle:
            handle.write(f"{name}={value}\n")
    else:
        print(f"{name}={value}")


def identity(item: dict) -> tuple[str, str, str]:
    return (str(item.get("domain", "")), str(item.get("source", "")), str(item.get("id", "")))


def main() -> int:
    current = collect()
    previous = load_snapshot()
    previous_ids = {identity(item) for item in previous}
    new_records = [item for item in current if identity(item) not in previous_ids]

    bootstrap = not SNAPSHOT.exists()
    save_json(SNAPSHOT, current)
    save_json(NEW_RECORDS, [] if bootstrap else new_records)

    write_output("bootstrap", "true" if bootstrap else "false")
    write_output("new_count", str(0 if bootstrap else len(new_records)))
    write_output("total_count", str(len(current)))

    if bootstrap:
        print(f"Bootstrapped CT snapshot with {len(current)} certificates.")
    elif new_records:
        print(f"Detected {len(new_records)} newly observed CT certificates.")
        for record in new_records[:25]:
            print(f"- {record['domain']} | source={record['source']} | id={record['id']} | issuer={record['issuer_name']} | names={','.join(record['names'])}")
    else:
        print(f"No newly observed certificates. Current snapshot: {len(current)}.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"CT monitor failed: {exc}", file=sys.stderr)
        raise
