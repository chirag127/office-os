"""
Office OS - DNS Manager
Manages CNAME records for subdomains pointing to the main deployment.
Supports both API Token and Global API Key authentication.
"""
import os
import requests

try:
    from dotenv import load_dotenv
    # Load from ops/.env if exists, otherwise project root .env
    if os.path.exists(os.path.join(os.path.dirname(__file__), '.env')):
        load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    else:
        load_dotenv()
except ImportError:
    pass

# Configuration
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
CF_GLOBAL_API_KEY = os.getenv("CLOUDFLARE_GLOBAL_API_KEY")
CF_EMAIL = os.getenv("CLOUDFLARE_EMAIL")
ZONE_ID = os.getenv("CLOUDFLARE_ZONE_ID")
DOMAIN = os.getenv("CLOUDFLARE_DOMAIN", "oriz.in")
TARGET_CNAME = os.getenv("CLOUDFLARE_TARGET_CNAME", "office-os.pages.dev")

# Subdomains to create (will point to TARGET_CNAME)
SUBDOMAINS = [
    "o",           # Main: o.oriz.in
    "office",      # office.oriz.in
    "pdf",         # pdf.oriz.in
    "tools",       # tools.oriz.in
    "docs",        # docs.oriz.in
    "app",         # app.oriz.in
]

API_BASE = "https://api.cloudflare.com/client/v4"

def get_headers():
    """Get auth headers - supports both API Token and Global API Key."""
    if CF_API_TOKEN:
        return {
            "Authorization": f"Bearer {CF_API_TOKEN}",
            "Content-Type": "application/json"
        }
    elif CF_GLOBAL_API_KEY and CF_EMAIL:
        return {
            "X-Auth-Email": CF_EMAIL,
            "X-Auth-Key": CF_GLOBAL_API_KEY,
            "Content-Type": "application/json"
        }
    else:
        print("❌ Error: No valid Cloudflare credentials found.")
        print("   Set CLOUDFLARE_API_TOKEN or (CLOUDFLARE_GLOBAL_API_KEY + CLOUDFLARE_EMAIL)")
        exit(1)

def get_zone_id(domain):
    """Fetch Zone ID for a domain."""
    url = f"{API_BASE}/zones?name={domain}"
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        result = response.json().get("result", [])
        if result:
            return result[0]["id"]
    print(f"❌ Could not find Zone ID for domain: {domain}")
    print(f"   Response: {response.text}")
    return None

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
        print(f"✅ Created CNAME: {name}.{DOMAIN} -> {target}")
        return True
    else:
        print(f"❌ Failed to create {name}: {response.text}")
        return False

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
        print(f"✅ Updated CNAME: {name}.{DOMAIN} -> {target}")
        return True
    else:
        print(f"❌ Failed to update {name}: {response.text}")
        return False

def main():
    global ZONE_ID

    print(f"🔧 Office OS DNS Manager")
    print(f"   Domain: {DOMAIN}")
    print(f"   Target: {TARGET_CNAME}")
    print()

    # Get Zone ID if not provided
    if not ZONE_ID:
        print(f"🔍 Fetching Zone ID for {DOMAIN}...")
        ZONE_ID = get_zone_id(DOMAIN)
        if not ZONE_ID:
            exit(1)

    print(f"📍 Zone ID: {ZONE_ID}")
    print()

    # Fetch existing records
    existing_records = get_dns_records(ZONE_ID)
    existing_map = {}
    for r in existing_records:
        if r["type"] == "CNAME":
            # Extract subdomain from full name (e.g., "o.oriz.in" -> "o")
            sub = r["name"].replace(f".{DOMAIN}", "")
            existing_map[sub] = r

    # Process each subdomain
    for sub in SUBDOMAINS:
        record = existing_map.get(sub)

        if record:
            if record["content"] != TARGET_CNAME:
                print(f"🔄 Updating {sub}...")
                update_cname(ZONE_ID, record["id"], sub, TARGET_CNAME)
            else:
                print(f"✨ {sub}.{DOMAIN} already points to {TARGET_CNAME}")
        else:
            print(f"➕ Creating {sub}...")
            create_cname(ZONE_ID, sub, TARGET_CNAME)

    print()
    print("✅ DNS Management Complete!")

if __name__ == "__main__":
    main()
