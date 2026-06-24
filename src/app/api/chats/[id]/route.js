import { getDb } from "@/lib/db";

// GET /api/chats/[id] — get a single chat with its messages
export async function GET(request, { params }) {
  const { id } = await params;
  const db = getDb();

  const chat = db.prepare("SELECT * FROM chats WHERE id = ?").get(id);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = db
    .prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC")
    .all(id);

  return Response.json({ chat, messages });
}

// DELETE /api/chats/[id] — delete a chat and its messages
export async function DELETE(request, { params }) {
  const { id } = await params;
  const db = getDb();

  const chat = db.prepare("SELECT * FROM chats WHERE id = ?").get(id);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM messages WHERE chat_id = ?").run(id);
  db.prepare("DELETE FROM chats WHERE id = ?").run(id);

  return Response.json({ success: true });
}

// PATCH /api/chats/[id] — update chat title
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const chat = db.prepare("SELECT * FROM chats WHERE id = ?").get(id);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const updates = [];
  const values = [];

  if (body.title) {
    updates.push("title = ?");
    values.push(body.title);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);
    db.prepare(`UPDATE chats SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare("SELECT * FROM chats WHERE id = ?").get(id);
  return Response.json({ chat: updated });
}
