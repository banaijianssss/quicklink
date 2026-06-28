import { auth } from "@/auth";
import { createTeamInvite, listTeamForOwner } from "@/lib/team";
import { getAppUrl } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const members = await listTeamForOwner(session.user.id);
  return NextResponse.json({ data: members });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await createTeamInvite({
    ownerId: session.user.id,
    plan: session.user.plan,
    email: String(body.email || ""),
    role: body.role ? String(body.role) : undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const inviteUrl = `${getAppUrl()}/team/accept?token=${result.invite.token}`;
  return NextResponse.json({ invite: result.invite, inviteUrl }, { status: 201 });
}