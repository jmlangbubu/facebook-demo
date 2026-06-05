const bcrypt = require('bcrypt');
const fs = require('fs/promises');
const path = require('path');
const readlineSync = require('readline-sync');
const { randomUUID } = require('crypto');

const SALT_ROUNDS = 10;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'login-logs.json');

const defaultDemoUsers = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'student', password: 'student123', role: 'Student' }
];

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJsonArray(filePath, []);
      return [];
    }

    console.log(`Could not read ${path.basename(filePath)}. Recreating a safe demo file.`);
    await writeJsonArray(filePath, []);
    return [];
  }
}

async function writeJsonArray(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function seedDefaultUsersIfNeeded() {
  const users = await readJsonArray(USERS_FILE);
  if (users.length > 0) {
    return;
  }

  const createdAt = new Date().toISOString();
  const seededUsers = await Promise.all(
    defaultDemoUsers.map(async (user) => ({
      id: randomUUID(),
      username: user.username,
      passwordHash: await bcrypt.hash(user.password, SALT_ROUNDS),
      role: user.role,
      createdAt
    }))
  );

  await writeJsonArray(USERS_FILE, seededUsers);
  console.log('Default demo users created with bcrypt password hashes.');
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await seedDefaultUsersIfNeeded();
  await readJsonArray(LOGS_FILE);
}

function showMenu() {
  console.log('\n=== PHISHGUARD USER MANAGEMENT TERMINAL ===');
  console.log('1. View Users');
  console.log('2. Add User');
  console.log('3. Delete User');
  console.log('4. Update User Role');
  console.log('5. View Login Logs');
  console.log('6. Clear Login Logs');
  console.log('7. Exit');
}

async function viewUsers() {
  const users = await readJsonArray(USERS_FILE);
  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  console.table(
    users.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }))
  );
}

async function addUser() {
  const username = readlineSync.question('Username: ').trim();
  if (!username) {
    console.log('Username is required.');
    return;
  }

  const users = await readJsonArray(USERS_FILE);
  if (users.some((user) => user.username === username)) {
    console.log('That username already exists.');
    return;
  }

  const password = readlineSync.question('Password: ', {
    hideEchoBack: true,
    mask: '*'
  });
  const role = readlineSync.question('Role: ').trim() || 'Student';

  if (!password) {
    console.log('Password is required.');
    return;
  }

  users.push({
    id: randomUUID(),
    username,
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    role,
    createdAt: new Date().toISOString()
  });

  await writeJsonArray(USERS_FILE, users);
  console.log(`User "${username}" added. Password hash was saved; plaintext password was not stored.`);
}

async function deleteUser() {
  const username = readlineSync.question('Username to delete: ').trim();
  const users = await readJsonArray(USERS_FILE);
  const remainingUsers = users.filter((user) => user.username !== username);

  if (remainingUsers.length === users.length) {
    console.log('User not found.');
    return;
  }

  await writeJsonArray(USERS_FILE, remainingUsers);
  console.log(`User "${username}" deleted.`);
}

async function updateUserRole() {
  const username = readlineSync.question('Username to update: ').trim();
  const users = await readJsonArray(USERS_FILE);
  const user = users.find((item) => item.username === username);

  if (!user) {
    console.log('User not found.');
    return;
  }

  const role = readlineSync.question('New role: ').trim();
  if (!role) {
    console.log('Role is required.');
    return;
  }

  user.role = role;
  await writeJsonArray(USERS_FILE, users);
  console.log(`Role updated for "${username}".`);
}

async function viewLoginLogs() {
  const logs = await readJsonArray(LOGS_FILE);
  if (logs.length === 0) {
    console.log('No login logs found.');
    return;
  }

  console.table(
    logs.map((log) => ({
      id: log.id,
      username: log.username,
      status: log.status,
      timestamp: log.timestamp,
      ip: log.ip,
      password: '********'
    }))
  );
}

async function clearLoginLogs() {
  const confirmed = readlineSync.question('Clear all login logs? Type YES to confirm: ');
  if (confirmed !== 'YES') {
    console.log('Clear cancelled.');
    return;
  }

  await writeJsonArray(LOGS_FILE, []);
  console.log('Login logs cleared.');
}

async function main() {
  await ensureDataFiles();

  let running = true;
  while (running) {
    showMenu();
    const choice = readlineSync.question('Choose an option: ').trim();

    try {
      switch (choice) {
        case '1':
          await viewUsers();
          break;
        case '2':
          await addUser();
          break;
        case '3':
          await deleteUser();
          break;
        case '4':
          await updateUserRole();
          break;
        case '5':
          await viewLoginLogs();
          break;
        case '6':
          await clearLoginLogs();
          break;
        case '7':
          running = false;
          console.log('Exiting safely.');
          break;
        default:
          console.log('Please choose a valid option.');
      }
    } catch (error) {
      console.log('An operation failed. Please check the data files and try again.');
    }
  }
}

main().catch(() => {
  console.log('The user management terminal could not start.');
});
