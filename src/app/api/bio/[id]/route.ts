import { auth } from "@/auth";
import { parseBioLinks, updateBioPageForUser } from "@/lib/bio";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await updateBioPageForUser({
    userId: session.user.id,
    pageId: id,
    title: body.title !== undefined ? String(body.title) : undefined,
    bio: body.bio !== undefined ? String(body.bio) : undefined,
    avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl) : undefined,
    theme: body.theme !== undefined ? String(body.theme) : undefined,
    links: body.links !== undefined ? parseBioLinks(body.links) : undefined,
    active: body.active !== undefined ? Boolean(body.active) : undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ page: result.page });
}