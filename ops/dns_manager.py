import os
import requests
import json
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configuration
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
ZONE_ID = os.getenv("CLOUDFLARE_ZONE_ID")
TARGET_DOMAIN = "o.oriz.in"  # The target your CNAMEs should point to (or the pages setup)

# List of subdomains to manage
SUBDOMAINS = [
    "app",
    "pdf",
    "img",
    "tools",
    "docs",
    "ai"
]

API_BASE = "https://api.cloudflare.com/client/v4"

def get_headers():
    if not CF_API_TOKEN:
        print("❌ Error: CLOUDFLARE_API_TOKEN not found in .env")
        exit(1)
    return {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json"
    }

def get_dns_records(zone_id):
    """Fetch existing DNS records for the zone."""
    url = f"{API_BASE}/zones/{zone_id}/dns_records?per_page=100"
    response = requests.get(url, headers=get_headers())
    if response.status_code != 200:
        print(f"❌ Failed to fetch DNS records: {response.text}")
        return []
    return response.json().get("result", [])

def create_cname(zone_id, name, target, proxied=True):
    """Create a CNAME record."""
    url = f"{API_BASE}/zones/{zone_id}/dns_records"
    data = {
        "type": "CNAME",
        "name": name,
        "content": target,
        "ttl": 1,  # Auto
        "proxied": proxied
    }
    response = requests.post(url, headers=get_headers(), json=data)
    if response.status_code == 200:
        print(f"✅ Created CNAME: {name} -> {target}")
    else:
        print(f"❌ Failed to create {name}: {response.text}")

def update_cname(zone_id, record_id, name, target, proxied=True):
    """Update an existing CNAME record."""
    url = f"{API_BASE}/zones/{zone_id}/dns_records/{record_id}"
    data = {
        "type": "CNAME",
        "name": name,
        "content": target,
        "ttl": 1,
        "proxied": proxied
    }
    response = requests.put(url, headers=get_headers(), json=data)
    if response.status_code == 200:
        print(f"✅ Updated CNAME: {name} -> {target}")
    else:
        print(f"❌ Failed to update {name}: {response.text}")

def main():
    if not ZONE_ID:
        print("❌ Error: CLOUDFLARE_ZONE_ID not found in .env")
        exit(1)

    print(f"🔍 Managing DNS for Zone ID: {ZONE_ID}")
    print(f"🎯 Target: {TARGET_DOMAIN}")

    existing_records = get_dns_records(ZONE_ID)
    existing_map = {r["name"].split('.')[0]: r for r in existing_records if r["type"] == "CNAME"}

    for sub in SUBDOMAINS:
        # Construct full hostname check if needed, but here assuming zone match
        # If subdomain is "app", name in CF is "app.yourdomain.com"
        # We just match based on the sub prefix we know

        record = existing_map.get(sub)

        if record:
            # Check if update needed
            if record["content"] != TARGET_DOMAIN:
                print(f"🔄 Updating {sub}...")
                update_cname(ZONE_ID, record["id"], sub, TARGET_DOMAIN)
            else:
                print(f"✨ {sub} is already correct.")
        else:
            print(f"➕ Creating {sub}...")
            create_cname(ZONE_ID, sub, TARGET_DOMAIN)

if __name__ == "__main__":
    main()
