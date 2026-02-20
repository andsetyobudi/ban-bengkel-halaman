// Check all users and their login credentials
import 'dotenv/config';

const results = [];

async function checkUsers() {
    const res = await fetch('http://localhost:3000/api/admin/initial-data');
    const data = await res.json();
    if (data.adminUsers) {
        results.push("=== USERS ===");
        data.adminUsers.forEach(u => results.push(`id=${u.id} name=${u.name} email/username=${u.email} role=${u.role} outletId=${u.outletId || 'none'}`));
    }
}

async function testLogin(username, password) {
    const res = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    results.push(`${username}/${password} -> ${res.status} ${JSON.stringify(data)}`);
    return res.status;
}

await checkUsers();
results.push("\n=== LOGIN TESTS ===");
const usernames = ['admin', 'andysetyobudi', 'fzahro09', 'andy', 'Admin'];
for (const u of usernames) {
    await testLogin(u, 'admin');
    await testLogin(u, u);
    await testLogin(u, '123456');
}

// Write results to file
import { writeFileSync } from 'fs';
writeFileSync('test-login-results.txt', results.join('\n'), 'utf8');
console.log("Results written to test-login-results.txt");
