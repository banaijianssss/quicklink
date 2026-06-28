import { auth } from "@/auth";
import { createFolderForUser, listUserFolders } from "@/lib/folders";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const folders = await listUserFolders(session.user.id);
  return NextResponse.json({ data: folders });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await createFolderForUser({
    userId: session.user.id,
    plan: session.user.plan,
    name: String(body.name || ""),
    color: body.color ? String(body.color) : undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ folder: result.folder }, { status: 201 });
}