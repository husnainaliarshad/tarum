import { queryAll } from "@/lib/db";

export async function GET() {
  try {
    const templates = queryAll("SELECT * FROM templates");
    return Response.json({ templates });
  } catch (error) {
    return Response.json({ error: "Failed to retrieve templates" }, { status: 500 });
  }
}
