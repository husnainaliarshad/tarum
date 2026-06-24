import { queryOne, queryAll, execute } from "@/lib/db";

// GET /api/chats/[id] — get a single chat with its messages
export async function GET(request, { params }) {
  const { id } = await params;

  const chat = queryOne("SELECT * FROM chats WHERE id = ?", [id]);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = queryAll(
    "SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
    [id]
  );

  return Response.json({ chat, messages });
}

// DELETE /api/chats/[id] — delete a chat and its messages
export async function DELETE(request, { params }) {
  const { id } = await params;

  const chat = queryOne("SELECT * FROM chats WHERE id = ?", [id]);
  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  execute("DELETE FROM messages WHERE chat_id = ?", [id]);
  execute("DELETE FROM chats WHERE id = ?", [id]);

  return Response.json({ success: true });
}

// PATCH /api/chats/[id] — update chat title
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const chat = queryOne("SELECT * FROM chats WHERE id = ?", [id]);
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
    execute(`UPDATE chats SET ${updates.join(", ")} WHERE id = ?`, values);
  }

  const updated = queryOne("SELECT * FROM chats WHERE id = ?", [id]);
  return Response.json({ chat: updated });
}
