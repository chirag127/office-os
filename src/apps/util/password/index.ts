/**
 * Office OS - Password Generator Tool
 */
import { generatePassword, calculatePasswordStrength } from '../../../services/utility';
import { renderToolPage, showToast } from '../../../components/shared';

export function renderPasswordGenerator(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Password Generator',
    description: 'Generate secure, random passwords',
    toolContent: `
      <div class="password-display">
        <input type="text" id="password" class="password-output" readonly value="">
        <button id="copy-btn" class="btn btn-icon" title="Copy">📋</button>
        <button id="refresh-btn" class="btn btn-icon" title="Generate new">🔄</button>
      </div>
      <div id="strength-bar" class="strength-bar"><div id="strength-fill" class="strength-fill"></div></div>
      <div id="strength-text" class="strength-text"></div>
      <div class="password-options">
        <label>Length: <span id="length-val">16</span><input type="range" id="length" min="8" max="64" value="16"></label>
        <div class="option-checks">
          <label><input type="checkbox" id="uppercase" checked> Uppercase (A-Z)</label>
          <label><input type="checkbox" id="lowercase" checked> Lowercase (a-z)</label>
          <label><input type="checkbox" id="numbers" checked> Numbers (0-9)</label>
          <label><input type="checkbox" id="symbols" checked> Symbols (!@#$)</label>
        </div>
      </div>
      <style>.password-display{display:flex;gap:var(--space-md);margin-bottom:var(--space-lg);}.password-output{flex:1;font-family:monospace;font-size:var(--font-size-xl);padding:var(--space-lg);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-md);text-align:center;letter-spacing:2px;}.strength-bar{height:8px;background:var(--color-bg-tertiary);border-radius:4px;overflow:hidden;margin-bottom:var(--space-sm);}.strength-fill{height:100%;transition:width 0.3s,background 0.3s;}.strength-text{text-align:center;font-size:var(--font-size-sm);margin-bottom:var(--space-xl);}.password-options{padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.password-options label{display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);}.option-checks{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-top:var(--space-lg);}</style>
    `,
    seoContent: `
      <h2>Secure Password Generator</h2>
      <p>Generate strong, random passwords for your accounts. Our generator creates cryptographically secure passwords that are impossible to guess.</p>
      <h3>Password Strength</h3>
      <ul>
        <li><strong>Length:</strong> Longer passwords are stronger. Use at least 16 characters.</li>
        <li><strong>Variety:</strong> Mix uppercase, lowercase, numbers, and symbols.</li>
        <li><strong>Randomness:</strong> Our generator uses cryptographic randomness.</li>
      </ul>
      <h3>Password Tips</h3>
      <ul>
        <li>Use a unique password for each account</li>
        <li>Store passwords in a password manager</li>
        <li>Enable two-factor authentication when available</li>
        <li>Never share passwords via email or text</li>
      </ul>
      <h3>Privacy</h3>
      <p>Passwords are generated locally in your browser using the Web Crypto API. Nothing is stored or transmitted.</p>
    `,
  });
}

function init(): void {
  const generate = () => {
    const length = parseInt((document.getElementById('length') as HTMLInputElement).value);
    const options = {
      uppercase: (document.getElementById('uppercase') as HTMLInputElement).checked,
      lowercase: (document.getElementById('lowercase') as HTMLInputElement).checked,
      numbers: (document.getElementById('numbers') as HTMLInputElement).checked,
      symbols: (document.getElementById('symbols') as HTMLInputElement).checked,
    };

    const password = generatePassword(length, options);
    (document.getElementById('password') as HTMLInputElement).value = password;

    const strength = calculatePasswordStrength(password);
    const fill = document.getElementById('strength-fill')!;
    fill.style.width = `${strength.score * 12.5}%`;
    fill.style.background = strength.score <= 2 ? '#ef4444' : strength.score <= 4 ? '#f59e0b' : strength.score <= 6 ? '#22c55e' : '#10b981';
    document.getElementById('strength-text')!.textContent = strength.label.replace('-', ' ').toUpperCase();
  };

  document.getElementById('length')?.addEventListener('input', (e) => {
    document.getElementById('length-val')!.textContent = (e.target as HTMLInputElement).value;
    generate();
  });

  ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', generate);
  });

  document.getElementById('refresh-btn')?.addEventListener('click', generate);

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText((document.getElementById('password') as HTMLInputElement).value);
    showToast('Password copied!', 'success');
  });

  generate();
}
