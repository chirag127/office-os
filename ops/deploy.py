import os
import subprocess
import sys
import shutil
from pathlib import Path

# Try to load .env, but don't fail if missing (wrangler might have its own auth)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Skipping .env loading.")

def run_command(command, cwd=None, shell=True):
    """Run a shell command and print output."""
    print(f"Executing: {command}")
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=shell,
            check=True,
            text=True,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        sys.exit(1)

def check_wrangler():
    """Check if wrangler is installed."""
    if shutil.which("wrangler") is None:
        print("Wrangler CLI is not installed. Installing globally...")
        run_command("npm install -g wrangler")

def main():
    # Root directory (one level up from ops/)
    project_root = Path(__file__).parent.parent.absolute()
    dist_dir = project_root / "dist"

    print("🚀 Starting Office OS Deployment...")

    # 1. Install Dependencies
    print("\n📦 Installing Node dependencies...")
    run_command("npm install", cwd=project_root)

    # 2. Build Project
    print("\n🛠️  Building project...")
    run_command("npm run build", cwd=project_root)

    if not dist_dir.exists():
        print(f"❌ Build failed. Directory not found: {dist_dir}")
        sys.exit(1)

    # 3. Check Wrangler
    check_wrangler()

    # 4. Deploy to Cloudflare Pages
    project_name = os.getenv("CF_PAGES_PROJECT", "office-os")
    branch = os.getenv("CF_PAGES_BRANCH", "main")

    print(f"\n☁️  Deploying to Cloudflare Pages ({project_name})...")

    # Construct deployment command
    # Uses CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN from env implicitly if set
    deploy_cmd = f"wrangler pages deploy dist --project-name={project_name} --branch={branch} --commit-dirty=true"

    run_command(deploy_cmd, cwd=project_root)

    print("\n✅ Deployment Complete!")

if __name__ == "__main__":
    main()
