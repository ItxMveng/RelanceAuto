// Test bout en bout de l'envoi réel : serveur SMTP local + application lancée avec ALLOW_PRIVATE_SMTP=1.
// Usage : node scripts/smtp-e2e.mjs [http://localhost:3200]
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';

const BASE = process.argv[2] || 'http://localhost:3200';
const received = [];
let rejectAuth = false;

const server = new SMTPServer({
  authOptional: false,
  allowInsecureAuth: true,
  disabledCommands: ['STARTTLS'],
  onAuth(auth, _session, cb) {
    if (rejectAuth || auth.password !== 'secret-pass') return cb(new Error('Invalid login'));
    cb(null, { user: auth.username });
  },
  async onData(stream, _session, cb) {
    const mail = await simpleParser(stream);
    received.push(mail);
    cb();
  },
});
await new Promise((r) => server.listen(2525, '127.0.0.1', r));

let cookie = '';
async function call(path, method = 'GET', body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
};

const email = `smtp-e2e-${Date.now()}@example.com`;
let r = await call('/api/auth/signup', 'POST', { email, password: 'Passw0rd-test', name: 'Sophie' });
check('inscription', r.json.ok);
r = await call('/api/settings', 'PUT', { my_name: 'Sophie', activity: 'en sophrologie', booking_link: 'https://cal.com/sophie/15min', tone: 'warm', send_from_hour: 0, send_to_hour: 24 });
check('profil enregistré', r.json.ok, r.json.error);

r = await call('/api/email/connect', 'POST', { host: '127.0.0.1', port: 2525, user: 'sophie@exemple.fr', pass: 'wrong', sendTest: true });
check('mauvais mot de passe refusé avec un message clair', !r.json.ok && /mot de passe/i.test(r.json.error || ''), r.json.error);

r = await call('/api/email/connect', 'POST', { host: '127.0.0.1', port: 2525, user: 'sophie@exemple.fr', pass: 'secret-pass', from: 'Sophie <sophie@exemple.fr>', sendTest: true });
check('connexion vérifiée + activée', r.json.ok && r.json.verified, r.json.error);
check('email de test envoyé', r.json.testSent, r.json.testError);

r = await call('/api/leads', 'POST', { name: 'Camille Martin', email: 'camille@prospect.fr', message: 'Bonjour' });
check('contact ajouté', r.json.ok, r.json.error);
await new Promise((res) => setTimeout(res, 800));

const first = received.find((m) => /Votre message/.test(m.subject || ''));
check('J+0 réellement envoyé par SMTP', !!first);
if (first) {
  check('destinataire correct', first.to?.value?.[0]?.address === 'camille@prospect.fr');
  check('expéditeur = boîte de l’utilisateur', /sophie@exemple\.fr/.test(first.from?.text || ''), first.from?.text);
  check('prénom et lien personnalisés', /Bonjour Camille/.test(first.text) && /cal\.com\/sophie\/15min/.test(first.text));
  check('lien de désinscription dans le corps', /\/u\/[a-f0-9]{24}/.test(first.text));
  check('en-tête List-Unsubscribe présent', !!first.headers.get('list')?.unsubscribe);
}
const before = received.length;

r = await call('/api/sim/advance', 'POST', { days: 2 });
check('voyage dans le temps refusé en envoi réel', !r.json.ok);

r = await call('/api/webhooks/reply?key=x', 'POST', { email: 'camille@prospect.fr' });
check('webhook de réponse : clé invalide refusée', r.status === 401);

r = await call('/api/email/disconnect', 'POST');
check('déconnexion → retour en simulation', r.json.ok);
console.log(`${received.length} email(s) reçus par le serveur SMTP de test (avant déconnexion : ${before}).`);
server.close();
process.exit(process.exitCode || 0);
