#!/usr/bin/env python3
"""Passive certificate-transparency monitor for Raeburn public domains.

This queries crt.sh's public CT index, compares certificate IDs against a
committed snapshot, and emits GitHub Actions outputs describing newly observed
certificates. CT information is public; no secrets or private infrastructure
are queried.
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
USER_AGENT = "Raeburn-CT-Monitor/1.0 (+https://theraeburngroup.com)"


def fetch_domain(domain: str) -> list[dict]:
    query = urllib.parse.quote(f"%.{domain}", safe="")
    url = f"https://crt.sh/?q={query}&output=json"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                data = json.load(response)
            if not isinstance(data, list):
                raise ValueError("Unexpected crt.sh response shape")
            return data
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < 3:
                time.sleep(2**attempt)
    raise RuntimeError(f"crt.sh query failed for {domain}: {last_error}")


def normalize_record(domain: str, row: dict) -> dict:
    names = sorted(
        {
            name.strip().lower()
            for name in str(row.get("name_value", "")).splitlines()
            if name.strip()
        }
    )
    return {
        "domain": domain,
        "id": int(row.get("id", 0)),
        "issuer_name": str(row.get("issuer_name", "")),
        "common_name": str(row.get("common_name", "")),
        "names": names,
        "not_before": str(row.get("not_before", "")),
        "not_after": str(row.get("not_after", "")),
        "entry_timestamp": str(row.get("entry_timestamp", "")),
        "serial_number": str(row.get("serial_number", "")),
    }


def collect() -> list[dict]:
    records: dict[tuple[str, int], dict] = {}
    for domain in DOMAINS:
        for raw in fetch_domain(domain):
            record = normalize_record(domain, raw)
            if record["id"]:
                records[(domain, record["id"])] = record
    return sorted(records.values(), key=lambda item: (item["domain"], item["id"]))


def load_snapshot() -> list[dict]:
    if not SNAPSHOT.exists():
        return []
    payload = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    return payload.get("certificates", []) if isinstance(payload, dict) else []


def save_json(path: pathlib.Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "domains": list(DOMAINS),
        "certificates": records,
    }
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_output(name: str, value: str) -> None:
    output_file = os.getenv("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a", encoding="utf-8") as handle:
            handle.write(f"{name}={value}\n")
    else:
        print(f"{name}={value}")


def main() -> int:
    current = collect()
    previous = load_snapshot()
    previous_ids = {(item.get("domain"), int(item.get("id", 0))) for item in previous}
    new_records = [
        item for item in current if (item["domain"], item["id"]) not in previous_ids
    ]

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
            print(
                f"- {record['domain']} | id={record['id']} | "
                f"issuer={record['issuer_name']} | names={','.join(record['names'])}"
            )
    else:
        print(f"No newly observed certificates. Current snapshot: {len(current)}.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"CT monitor failed: {exc}", file=sys.stderr)
        raise
