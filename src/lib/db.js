import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "chats.db");

let db;

export function getDb() {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'New Chat',
        mode TEXT NOT NULL DEFAULT 'image',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        image_url TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'image'
      );

      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
    `);

    // Seed templates if empty
    const count = db.prepare("SELECT COUNT(*) AS count FROM templates").get().count;
    if (count === 0) {
      const insert = db.prepare("INSERT INTO templates (id, title, prompt, image_url, mode) VALUES (?, ?, ?, ?, ?)");
      insert.run("temp-1", "Sci-fi Desert", "A sci-fi girl standing in the desert looking at a planet in the night sky, futuristic armor with glowing orange lights, back view, realistic, cinematic style", "/sci_fi_girl_desert.png", "image");
      insert.run("temp-2", "Surreal Stone Hand", "A giant hand made of stone emerging from between cliffs, holding a washing machine, wrapped in beautiful violet flowers, high detail, surreal fantasy concept art", "/stone_hand_washing_machine.png", "image");
      insert.run("temp-3", "Raindrops Leaf", "Macro shot of raindrops on a leaf, detailed leaf veins, water droplets reflecting light, vibrant green and blue colors, soft bokeh background, high detail", "/raindrops_leaf.png", "image");
    }
  }
  return db;
}
