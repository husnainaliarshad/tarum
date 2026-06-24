import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET /api/chats — list all chats
export async function GET() {
  const db = getDb();
  const chats = db
    .prepare(
      `SELECT id, title, mode, created_at, updated_at,
        (SELECT metadata FROM messages WHERE chat_id = chats.id AND role = 'assistant' AND metadata IS NOT NULL ORDER BY created_at DESC LIMIT 1) AS assistant_metadata
       FROM chats ORDER BY updated_at DESC`
    )
    .all();

  const chatsWithThumbnails = chats.map((chat) => {
    let thumbnail = null;
    if (chat.assistant_metadata) {
      try {
        const meta = JSON.parse(chat.assistant_metadata);
        if (meta.results && meta.results.length > 0) {
          thumbnail = meta.results[0].url;
        }
      } catch (err) {
        console.error("Failed to parse metadata:", err);
      }
    }
    // Omit metadata from response
    const { assistant_metadata, ...chatData } = chat;
    return {
      ...chatData,
      thumbnail,
    };
  });

  return Response.json({ chats: chatsWithThumbnails });
}

// POST /api/chats — create a new chat
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { title, mode } = body;

  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO chats (id, title, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, title || "New Chat", mode || "image", now, now);

  const chat = db.prepare("SELECT * FROM chats WHERE id = ?").get(id);

  return Response.json({ chat }, { status: 201 });
}
