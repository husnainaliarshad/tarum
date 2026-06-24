import { queryOne, queryAll, execute, initDb } from "@/lib/db";

// GET /api/chats/[id]/messages — get all messages for a chat
export async function GET(request, { params }) {
  const { id } = await params;
  await initDb();

  const chat = await queryOne("SELECT id FROM chats WHERE id = ?", [id]);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = await queryAll(
    "SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
    [id]
  );

  return Response.json({ messages });
}

// POST /api/chats/[id]/messages — add a message to a chat
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { role, content, metadata } = body;
  await initDb();

  if (!role || !content) {
    return Response.json({ error: "role and content are required" }, { status: 400 });
  }

  const chat = await queryOne("SELECT id FROM chats WHERE id = ?", [id]);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const result = await execute(
    "INSERT INTO messages (chat_id, role, content, metadata) VALUES (?, ?, ?, ?)",
    [id, role, content, metadata ? JSON.stringify(metadata) : null]
  );

  // Update chat's updated_at
  await execute("UPDATE chats SET updated_at = ? WHERE id = ?", [
    new Date().toISOString(),
    id,
  ]);

  // Auto-title: use first user message as chat title
  const chatInfo = await queryOne("SELECT title FROM chats WHERE id = ?", [id]);
  if (chatInfo.title === "New Chat" && role === "user") {
    const title = content.length > 40 ? content.substring(0, 40) + "..." : content;
    await execute("UPDATE chats SET title = ? WHERE id = ?", [title, id]);
  }

  const message = await queryOne("SELECT * FROM messages WHERE id = ?", [Number(result.lastInsertRowid)]);

  return Response.json({ message }, { status: 201 });
}
