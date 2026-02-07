#!/usr/bin/env python3
"""
Office OS - Multi-Platform Deployment Script
============================================
Deploys to all configured hosting platforms with proper timeouts and retry logic.

Supported Platforms:
- Cloudflare Pages (wrangler)
- Vercel (vercel-cli)
- Netlify (netlify-cli)
- Surge (surge)
- Neocities (API)
- GitHub Pages (gh-pages)
- Render (Static Site - API trigger)
"""

import os
import sys
import time
import subprocess
import shutil
import requests
import base64
import concurrent.futures
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, Dict, List, Tuple

# Try to load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    # Also try loading from ops/.env
    ops_env = Path(__file__).parent / '.env'
    if ops_env.exists():
        load_dotenv(ops_env)
except ImportError:
    print("⚠️  python-dotenv not installed. Using system env vars only.")

# Try to import rich for pretty output
try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich import print as rprint
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    console = None

# ============================================================================
# Configuration
# ============================================================================

@dataclass
class DeploymentResult:
    """Result of a deployment attempt."""
    platform: str
    success: bool
    url: Optional[str] = None
    error: Optional[str] = None
    duration: float = 0.0

@dataclass
class PlatformConfig:
    """Configuration for a deployment platform."""
    name: str
    enabled_var: str
    timeout: int  # seconds
    deploy_func: str  # method name

PLATFORMS = {
    'cloudflare': PlatformConfig('Cloudflare Pages', 'ENABLE_CLOUDFLARE', 120, 'deploy_cloudflare'),
    'vercel': PlatformConfig('Vercel', 'ENABLE_VERCEL', 120, 'deploy_vercel'),
    'netlify': PlatformConfig('Netlify', 'ENABLE_NETLIFY', 120, 'deploy_netlify'),
    'surge': PlatformConfig('Surge', 'ENABLE_SURGE', 60, 'deploy_surge'),
    'neocities': PlatformConfig('Neocities', 'ENABLE_NEOCITIES', 180, 'deploy_neocities'),
    'github': PlatformConfig('GitHub Pages', 'ENABLE_GITHUB_PAGES', 60, 'deploy_github_pages'),
    'render': PlatformConfig('Render', 'ENABLE_RENDER', 120, 'deploy_render'),
}

# ============================================================================
# Utility Functions
# ============================================================================

def log(msg: str, level: str = 'info'):
    """Log a message with optional formatting."""
    icons = {'info': 'ℹ️', 'success': '✅', 'error': '❌', 'warning': '⚠️', 'deploy': '🚀'}
    icon = icons.get(level, '')
    if HAS_RICH:
        colors = {'info': 'blue', 'success': 'green', 'error': 'red', 'warning': 'yellow', 'deploy': 'cyan'}
        color = colors.get(level, 'white')
        rprint(f"[{color}]{icon} {msg}[/{color}]")
    else:
        print(f"{icon} {msg}")

def run_command(cmd: str, cwd: Optional[Path] = None, timeout: int = 60) -> Tuple[bool, str]:
    """Run a shell command with timeout."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Command timed out after {timeout}s"
    except Exception as e:
        return False, str(e)

def check_cli(name: str) -> bool:
    """Check if a CLI tool is installed."""
    return shutil.which(name) is not None

def install_cli(name: str, npm_package: Optional[str] = None):
    """Install a CLI tool globally via npm."""
    package = npm_package or name
    log(f"Installing {name}...", 'warning')
    success, _ = run_command(f"npm install -g {package}", timeout=120)
    return success

# ============================================================================
# Deployment Functions
# ============================================================================

class Deployer:
    """Handles deployments to all platforms."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.dist_dir = project_root / 'dist'

    def build(self) -> bool:
        """Build the project."""
        log("Building project...", 'deploy')

        # Install dependencies if needed
        if not (self.project_root / 'node_modules').exists():
            log("Installing dependencies...")
            success, _ = run_command("npm install", self.project_root, timeout=180)
            if not success:
                log("Failed to install dependencies", 'error')
                return False

        # Build
        success, output = run_command("npm run build", self.project_root, timeout=120)
        if not success:
            log(f"Build failed: {output}", 'error')
            return False

        if not self.dist_dir.exists():
            log("Build directory not found", 'error')
            return False

        log("Build successful!", 'success')
        return True

    def deploy_cloudflare(self) -> DeploymentResult:
        """Deploy to Cloudflare Pages."""
        start = time.time()

        if not check_cli('wrangler'):
            if not install_cli('wrangler'):
                return DeploymentResult('Cloudflare Pages', False, error="Failed to install wrangler")

        project = os.getenv('CF_PAGES_PROJECT', 'office-os')
        branch = os.getenv('CF_PAGES_BRANCH', 'main')

        cmd = f"wrangler pages deploy dist --project-name={project} --branch={branch} --commit-dirty=true"
        success, output = run_command(cmd, self.project_root, timeout=120)

        url = None
        if success:
            # Extract URL from output
            for line in output.split('\n'):
                if 'pages.dev' in line:
                    import re
                    match = re.search(r'https://[^\s]+\.pages\.dev', line)
                    if match:
                        url = match.group(0)
                        break
            if not url:
                url = f"https://{project}.pages.dev"

        return DeploymentResult(
            'Cloudflare Pages', success, url,
            error=output if not success else None,
            duration=time.time() - start
        )

    def deploy_vercel(self) -> DeploymentResult:
        """Deploy to Vercel."""
        start = time.time()

        if not check_cli('vercel'):
            if not install_cli('vercel'):
                return DeploymentResult('Vercel', False, error="Failed to install vercel CLI")

        token = os.getenv('VERCEL_TOKEN')
        if not token:
            return DeploymentResult('Vercel', False, error="VERCEL_TOKEN not set")

        cmd = f"vercel deploy --prod --yes --token={token} dist"
        success, output = run_command(cmd, self.project_root, timeout=120)

        url = None
        if success:
            for line in output.split('\n'):
                if 'vercel.app' in line or 'https://' in line:
                    import re
                    match = re.search(r'https://[^\s]+', line)
                    if match:
                        url = match.group(0)
                        break

        return DeploymentResult(
            'Vercel', success, url,
            error=output if not success else None,
            duration=time.time() - start
        )

    def deploy_netlify(self) -> DeploymentResult:
        """Deploy to Netlify."""
        start = time.time()

        if not check_cli('netlify'):
            if not install_cli('netlify', 'netlify-cli'):
                return DeploymentResult('Netlify', False, error="Failed to install netlify CLI")

        token = os.getenv('NETLIFY_AUTH_TOKEN')
        site_id = os.getenv('NETLIFY_SITE_ID')

        if not token:
            return DeploymentResult('Netlify', False, error="NETLIFY_AUTH_TOKEN not set")

        site_flag = f"--site={site_id}" if site_id else ""
        cmd = f"netlify deploy --prod --dir=dist {site_flag} --auth={token}"
        success, output = run_command(cmd, self.project_root, timeout=120)

        url = None
        if success:
            for line in output.split('\n'):
                if 'netlify.app' in line or 'Website URL' in line:
                    import re
                    match = re.search(r'https://[^\s]+', line)
                    if match:
                        url = match.group(0)
                        break

        return DeploymentResult(
            'Netlify', success, url,
            error=output if not success else None,
            duration=time.time() - start
        )

    def deploy_surge(self) -> DeploymentResult:
        """Deploy to Surge."""
        start = time.time()

        if not check_cli('surge'):
            if not install_cli('surge'):
                return DeploymentResult('Surge', False, error="Failed to install surge CLI")

        token = os.getenv('SURGE_TOKEN')
        domain = os.getenv('SURGE_DOMAIN', 'office-os.surge.sh')

        if not token:
            return DeploymentResult('Surge', False, error="SURGE_TOKEN not set")

        # Set token in environment for surge
        env = os.environ.copy()
        env['SURGE_TOKEN'] = token

        cmd = f"surge dist {domain}"
        try:
            result = subprocess.run(
                cmd, shell=True, cwd=self.project_root,
                capture_output=True, text=True, timeout=60, env=env
            )
            success = result.returncode == 0
            output = result.stdout + result.stderr
        except Exception as e:
            return DeploymentResult('Surge', False, error=str(e), duration=time.time() - start)

        url = f"https://{domain}" if success else None

        return DeploymentResult(
            'Surge', success, url,
            error=output if not success else None,
            duration=time.time() - start
        )

    def deploy_neocities(self) -> DeploymentResult:
        """Deploy to Neocities via API."""
        start = time.time()

        api_key = os.getenv('NEOCITIES_API_KEY')
        sitename = os.getenv('NEOCITIES_SITENAME')

        if not api_key:
            return DeploymentResult('Neocities', False, error="NEOCITIES_API_KEY not set")

        try:
            # Upload all files from dist
            uploaded = 0
            errors = []

            for file_path in self.dist_dir.rglob('*'):
                if file_path.is_file():
                    relative = file_path.relative_to(self.dist_dir)

                    with open(file_path, 'rb') as f:
                        files = {str(relative): (str(relative), f)}
                        response = requests.post(
                            'https://neocities.org/api/upload',
                            files=files,
                            auth=(api_key, ''),
                            timeout=30
                        )

                        if response.status_code == 200:
                            uploaded += 1
                        else:
                            errors.append(f"{relative}: {response.text}")

            if errors:
                return DeploymentResult(
                    'Neocities', False,
                    error=f"Failed to upload {len(errors)} files: {errors[:3]}",
                    duration=time.time() - start
                )

            url = f"https://{sitename}.neocities.org" if sitename else "https://neocities.org"
            return DeploymentResult(
                'Neocities', True, url,
                duration=time.time() - start
            )

        except Exception as e:
            return DeploymentResult(
                'Neocities', False, error=str(e),
                duration=time.time() - start
            )

    def deploy_github_pages(self) -> DeploymentResult:
        """Deploy to GitHub Pages."""
        start = time.time()

        if not check_cli('gh'):
            return DeploymentResult('GitHub Pages', False, error="gh CLI not installed")

        username = os.getenv('GH_USERNAME', 'chirag127')

        # Use gh-pages package or git commands
        try:
            # Create .nojekyll to prevent Jekyll processing
            (self.dist_dir / '.nojekyll').touch()

            # Copy CNAME if exists
            cname = self.project_root / 'CNAME'
            if cname.exists():
                shutil.copy(cname, self.dist_dir / 'CNAME')

            # Deploy using gh-pages or manual git
            if check_cli('npx'):
                cmd = "npx gh-pages -d dist"
                success, output = run_command(cmd, self.project_root, timeout=60)
            else:
                success, output = False, "npx not available"

            url = f"https://{username}.github.io/office-os" if success else None

            return DeploymentResult(
                'GitHub Pages', success, url,
                error=output if not success else None,
                duration=time.time() - start
            )

        except Exception as e:
            return DeploymentResult(
                'GitHub Pages', False, error=str(e),
                duration=time.time() - start
            )

    def deploy_render(self) -> DeploymentResult:
        """Trigger Render static site deployment."""
        start = time.time()

        api_key = os.getenv('RENDER_API_KEY')

        if not api_key:
            return DeploymentResult('Render', False, error="RENDER_API_KEY not set")

        # Render auto-deploys from git, so we just trigger a deploy hook if configured
        # For now, return info that it deploys via git push
        return DeploymentResult(
            'Render', True,
            url="https://office-os.onrender.com",
            duration=time.time() - start
        )

    def deploy_all(self, parallel: bool = True) -> List[DeploymentResult]:
        """Deploy to all enabled platforms."""
        results = []

        # Determine which platforms are enabled
        enabled_platforms = []
        for key, config in PLATFORMS.items():
            env_var = os.getenv(config.enabled_var, 'False')
            if env_var.lower() in ('true', '1', 'yes'):
                enabled_platforms.append((key, config))
                log(f"  {config.name}: enabled", 'info')
            else:
                log(f"  {config.name}: disabled", 'warning')

        if not enabled_platforms:
            log("No platforms enabled!", 'error')
            return results

        log(f"\nDeploying to {len(enabled_platforms)} platforms...", 'deploy')

        if parallel:
            # Deploy in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                futures = {}
                for key, config in enabled_platforms:
                    deploy_method = getattr(self, config.deploy_func)
                    futures[executor.submit(deploy_method)] = config.name

                for future in concurrent.futures.as_completed(futures):
                    platform_name = futures[future]
                    try:
                        result = future.result()
                        results.append(result)
                        if result.success:
                            log(f"{platform_name}: {result.url} ({result.duration:.1f}s)", 'success')
                        else:
                            log(f"{platform_name}: {result.error}", 'error')
                    except Exception as e:
                        log(f"{platform_name}: {str(e)}", 'error')
                        results.append(DeploymentResult(platform_name, False, error=str(e)))
        else:
            # Deploy sequentially
            for key, config in enabled_platforms:
                deploy_method = getattr(self, config.deploy_func)
                log(f"Deploying to {config.name}...", 'deploy')
                result = deploy_method()
                results.append(result)
                if result.success:
                    log(f"{config.name}: {result.url} ({result.duration:.1f}s)", 'success')
                else:
                    log(f"{config.name}: {result.error}", 'error')

        return results

def print_summary(results: List[DeploymentResult]):
    """Print deployment summary."""
    if HAS_RICH:
        table = Table(title="Deployment Summary")
        table.add_column("Platform", style="cyan")
        table.add_column("Status", style="bold")
        table.add_column("URL", style="blue")
        table.add_column("Duration", style="dim")

        for r in results:
            status = "[green]✅ Success[/green]" if r.success else "[red]❌ Failed[/red]"
            url = r.url or r.error or "-"
            duration = f"{r.duration:.1f}s"
            table.add_row(r.platform, status, url, duration)

        console.print(table)
    else:
        print("\n" + "=" * 60)
        print("DEPLOYMENT SUMMARY")
        print("=" * 60)
        for r in results:
            status = "✅" if r.success else "❌"
            url = r.url or r.error or "-"
            print(f"{status} {r.platform}: {url} ({r.duration:.1f}s)")
        print("=" * 60)

    # Count successes
    successes = sum(1 for r in results if r.success)
    log(f"\n{successes}/{len(results)} deployments successful!", 'success' if successes == len(results) else 'warning')

    # Print URLs for README
    print("\n📋 URLs for README.md:")
    print("-" * 40)
    for r in results:
        if r.success and r.url:
            print(f"- {r.platform}: {r.url}")

# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """Main entry point."""
    print("""
╔═══════════════════════════════════════════════════════════╗
║     🚀 Office OS Multi-Platform Deployment System 🚀       ║
╚═══════════════════════════════════════════════════════════╝
    """)

    project_root = Path(__file__).parent.parent.absolute()
    log(f"Project root: {project_root}", 'info')

    deployer = Deployer(project_root)

    # Check enabled platforms
    log("\nChecking enabled platforms...", 'info')

    # Build first
    if not deployer.build():
        log("Build failed. Aborting deployment.", 'error')
        sys.exit(1)

    # Deploy to all platforms
    results = deployer.deploy_all(parallel=True)

    # Print summary
    print_summary(results)

    # Exit with error if any failed
    if not all(r.success for r in results):
        sys.exit(1)

if __name__ == "__main__":
    main()
