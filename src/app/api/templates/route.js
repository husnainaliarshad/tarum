import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const templates = db.prepare("SELECT * FROM templates").all();
    return Response.json({ templates });
  } catch (error) {
    return Response.json({ error: "Failed to retrieve templates" }, { status: 500 });
  }
}
