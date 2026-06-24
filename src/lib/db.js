import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "chats.db");

let db;

/**
 * Get or initialize the Turso (libsql) database client.
 * All execute() calls are async — they return Promises.
 */
export function getDb() {
  if (!db) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = createClient({
      url: `file:${dbPath}`,
    });
  }
  return db;
}

/**
 * Initialize database tables and seed data.
 * Must be awaited before using the database.
 */
export async function initDb() {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'New Chat',
      mode TEXT NOT NULL DEFAULT 'image',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      image_url TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'image'
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
  `);

  // Seed templates if empty
  const countResult = await db.execute("SELECT COUNT(*) AS count FROM templates");
  const count = Number(countResult.rows[0].count);
  if (count === 0) {
    const insertSql = "INSERT INTO templates (id, title, prompt, image_url, mode) VALUES (?, ?, ?, ?, ?)";
    await db.execute({ sql: insertSql, args: ["temp-1", "Sci-fi Desert", "A sci-fi girl standing in the desert looking at a planet in the night sky, futuristic armor with glowing orange lights, back view, realistic, cinematic style", "/sci_fi_girl_desert.png", "image"] });
    await db.execute({ sql: insertSql, args: ["temp-2", "Surreal Stone Hand", "A giant hand made of stone emerging from between cliffs, holding a washing machine, wrapped in beautiful violet flowers, high detail, surreal fantasy concept art", "/stone_hand_washing_machine.png", "image"] });
    await db.execute({ sql: insertSql, args: ["temp-3", "Raindrops Leaf", "Macro shot of raindrops on a leaf, detailed leaf veins, water droplets reflecting light, vibrant green and blue colors, soft bokeh background, high detail", "/raindrops_leaf.png", "image"] });
  }
}

/**
 * Execute a SELECT query and return all rows as plain objects.
 * @param {string} sql
 * @param {any[]} [args]
 * @returns {Promise<object[]>}
 */
export async function queryAll(sql, args = []) {
  const db = getDb();
  const result = await db.execute({ sql, args });
  return result.rows.map(row => ({ ...row }));
}

/**
 * Execute a SELECT query and return the first row as a plain object, or null.
 * @param {string} sql
 * @param {any[]} [args]
 * @returns {Promise<object|null>}
 */
export async function queryOne(sql, args = []) {
  const db = getDb();
  const result = await db.execute({ sql, args });
  if (result.rows.length === 0) return null;
  return { ...result.rows[0] };
}

/**
 * Execute an INSERT/UPDATE/DELETE statement.
 * @param {string} sql
 * @param {any[]} [args]
 * @returns {Promise<{ rowsAffected: number, lastInsertRowid: number | bigint | undefined }>}
 */
export async function execute(sql, args = []) {
  const db = getDb();
  const result = await db.execute({ sql, args });
  return {
    rowsAffected: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid,
  };
}
