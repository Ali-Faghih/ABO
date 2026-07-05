import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DB_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "abo.db");

let db: Awaited<ReturnType<Awaited<typeof initSqlJs>["SqlJs"]>>["Database"];

function save() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const file = fs.readFileSync(DB_PATH);
    db = new SQL.Database(file);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA journal_mode=WAL");
  db.run("PRAGMA foreign_keys=ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('donor','hospital')),
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS donor_profiles (
      userId TEXT PRIMARY KEY REFERENCES users(id),
      firstName TEXT NOT NULL DEFAULT '',
      lastName TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      birthDate TEXT DEFAULT '',
      gender TEXT DEFAULT 'male',
      city TEXT NOT NULL DEFAULT '',
      province TEXT NOT NULL DEFAULT '',
      address TEXT DEFAULT '',
      weight REAL DEFAULT 0,
      height REAL DEFAULT 0,
      bloodType TEXT NOT NULL DEFAULT 'O+',
      diseaseName TEXT DEFAULT '',
      medicationName TEXT DEFAULT '',
      readinessAvailable INTEGER DEFAULT 0,
      readinessDate TEXT,
      eligible INTEGER DEFAULT 1,
      nextEligible TEXT,
      lastDonation TEXT,
      joinDate TEXT NOT NULL DEFAULT '',
      donations INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS hospital_profiles (
      userId TEXT PRIMARY KEY REFERENCES users(id),
      hospitalId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      hospitalType TEXT DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      province TEXT NOT NULL DEFAULT '',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      licenseNumber TEXT DEFAULT '',
      managerFirstName TEXT DEFAULT '',
      managerLastName TEXT DEFAULT '',
      managerNationalId TEXT DEFAULT '',
      managerPosition TEXT DEFAULT '',
      managerPhone TEXT DEFAULT '',
      activeRequests INTEGER DEFAULT 0,
      totalDonors INTEGER DEFAULT 0,
      totalDonations INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      beds INTEGER DEFAULT 0,
      founded TEXT DEFAULT '',
      isListed INTEGER DEFAULT 0,
      joinDate TEXT NOT NULL DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      time TEXT NOT NULL,
      read INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      hospitalId TEXT NOT NULL REFERENCES users(id),
      donorId TEXT NOT NULL REFERENCES users(id),
      requestId TEXT DEFAULT '',
      lastMessage TEXT DEFAULT '',
      lastMessageTime TEXT,
      unread INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL REFERENCES conversations(id),
      senderId TEXT NOT NULL REFERENCES users(id),
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      summary TEXT DEFAULT '',
      author TEXT DEFAULT '',
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      imageUrl TEXT,
      publishDate TEXT,
      readCount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      hospitalId TEXT NOT NULL REFERENCES users(id),
      hospitalName TEXT NOT NULL DEFAULT '',
      bloodType TEXT NOT NULL,
      units INTEGER NOT NULL DEFAULT 1,
      urgency TEXT NOT NULL DEFAULT 'معمولی',
      deadline TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      matched INTEGER DEFAULT 0,
      city TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT '',
      notes TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      requestId TEXT NOT NULL REFERENCES requests(id),
      donorId TEXT NOT NULL REFERENCES users(id),
      donorName TEXT NOT NULL DEFAULT '',
      hospitalId TEXT NOT NULL REFERENCES users(id),
      hospitalName TEXT NOT NULL DEFAULT '',
      bloodType TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT '',
      initiator TEXT NOT NULL DEFAULT 'donor'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registry_donors (
      nationalId TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      birthDate TEXT,
      phone TEXT,
      gender TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registry_hospitals (
      hospitalId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      licenseNumber TEXT,
      address TEXT DEFAULT ''
    )
  `);

  // Indexes
  db.run("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)");
  db.run("CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId)");
  db.run("CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId)");
  db.run("CREATE INDEX IF NOT EXISTS idx_appointments_request ON appointments(requestId)");
  db.run("CREATE INDEX IF NOT EXISTS idx_requests_hospital ON requests(hospitalId)");

  save();
}

export function getDb() {
  return db;
}

export function saveDb() {
  save();
}

export function queryAll(sql: string, params: any[] = []): { columns: string[]; values: any[][] }[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const columns = stmt.getColumnNames();
  const values: any[][] = [];
  while (stmt.step()) {
    values.push(stmt.get());
  }
  stmt.free();
  return [{ columns, values }];
}
