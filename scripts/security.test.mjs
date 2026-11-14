import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicPath, assertNoSecrets } from './security.mjs';

test('production allows only intended code and media', () => {
  for (const file of ['index.html', 'css/ux.css', 'assets/img/fondo-pagina.png']) {
    assert.doesNotThrow(() => assertPublicPath(file));
  }
  for (const file of ['.env', 'assets/.env.png', 'assets/../private.png',
    'assets/secrets.json', 'assets/dump.sql', 'assets/file.php', '/etc/passwd',
    'assets/%2e%2e/key.png', 'assets\\private.png', 'scripts/build.mjs']) {
    assert.throws(() => assertPublicPath(file));
  }
});

test('secret guard rejects credentials without disclosing them', () => {
  const samples = [
    'ghp_' + 'x'.repeat(40),
    'sb_secret_' + 'x'.repeat(30),
    '-----BEGIN ' + 'PRIVATE KEY-----',
    'postgres' + '://user:secret@db.example/test',
    'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({role: 'service_role'})).toString('base64url') + '.signature',
  ];
  for (const secret of samples) {
    assert.throws(() => assertNoSecrets(secret, 'example.js'), error => !error.message.includes(secret));
  }
  assert.doesNotThrow(() => assertNoSecrets('localStorage.setItem("portfolio-theme", "dark")', 'theme.js'));
});
