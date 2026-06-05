const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const SALT_ROUNDS = 10;

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LOGS_FILE = path.join(DATA_DIR, "login-logs.json");
const PUBLIC_DIR = path.join(__dirname, "public");

const defaultDemoUsers = [
  { username: "admin", password: "admin123", role: "Admin" },
  { username: "student", password: "student123", role: "Student" }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");

    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeJsonArray(filePath, []);
      return [];
    }

    console.error(`[data] Could not read ${path.basename(filePath)}. Recreating demo file.`);
    await writeJsonArray(filePath, []);
    return [];
  }
}

async function writeJsonArray(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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
  console.log("[setup] Demo users created with bcrypt password hashes.");
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await seedDefaultUsersIfNeeded();
  await readJsonArray(LOGS_FILE);
}

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function safeTerminalText(value) {
  return String(value || "")
    .replace(/[\r\n\t]/g, " ")
    .trim() || "unknown";
}

async function appendLoginLog({
  username,
  passwordEntered,
  passwordLength,
  status,
  timestamp,
  ip
}) {
  const logs = await readJsonArray(LOGS_FILE);

  logs.push({
    id: randomUUID(),
    username: safeTerminalText(username),
    password: "********",
    passwordEntered: Boolean(passwordEntered),
    passwordLength: Number.isFinite(passwordLength) ? passwordLength : 0,
    status,
    timestamp,
    ip,
    lesson: "Password was masked and not stored or printed in plaintext."
  });

  await writeJsonArray(LOGS_FILE, logs);
}

function printSafeLoginAttempt({ username, passwordEntered, passwordLength }) {
  console.log("=== LOGIN ATTEMPT ===");
  console.log(`Username: ${safeTerminalText(username)}`);
  console.log("Password: ********");
  console.log(`Password Entered: ${passwordEntered ? "Yes" : "No"}`);
  console.log(`Password Length: ${Number.isFinite(passwordLength) ? passwordLength : 0}`);
  console.log("Status: Processing");
  console.log("=====================");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/attacker-demo.html", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "attacker-demo.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "running",
    port: PORT,
    host: HOST
  });
});

app.post("/api/login", async (req, res) => {
  const username =
    typeof req.body.username === "string" ? req.body.username.trim() : "";

  const passwordEntered = req.body.passwordEntered === true;

  const rawPasswordLength = Number(req.body.passwordLength);
  const passwordLength =
    Number.isFinite(rawPasswordLength) && rawPasswordLength >= 0
      ? Math.floor(rawPasswordLength)
      : 0;

  const ip = getClientIp(req);
  const timestamp = new Date().toISOString();
  const loggedUsername = username || "unknown";
  const status = "processing";

  try {
    await appendLoginLog({
      username: loggedUsername,
      passwordEntered,
      passwordLength,
      status,
      timestamp,
      ip
    });

    printSafeLoginAttempt({
      username: loggedUsername,
      passwordEntered,
      passwordLength
    });

    res.json({
      success: true,
      message: "Login request received."
    });
  } catch (error) {
    console.error("[login] Server error while processing login attempt.");

    printSafeLoginAttempt({
      username: loggedUsername,
      passwordEntered,
      passwordLength
    });

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

async function startServer() {
  await ensureDataFiles();

  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[startup] Could not start the server.");
  console.error(error);
  process.exit(1);
});