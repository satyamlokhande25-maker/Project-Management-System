import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = (global as any).prisma || new PrismaClient();

export async function POST(req: Request) {
  try {
    const { projectId, username } = await req.json();

    if (!projectId || !username) {
      return NextResponse.json({ error: "Missing projectId or username" }, { status: 400 });
    }

    // 1. Check karo user (jise share karna hai) exist karta hai ya nahi [cite: 2026-02-14]
    const targetUser = await prisma.user.findUnique({
      where: { username: username }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found. Unhe login karne ko kahein." }, { status: 404 });
    }

    // 2. Project check karo
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 3. ProjectShare table mein entry dalo (Yehi asli sharing hai) [cite: 2026-02-14]
    await prisma.projectShare.upsert({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: targetUser.id,
        },
      },
      update: {}, // Agar pehle se shared hai toh kuch mat karo
      create: {
        projectId: projectId,
        userId: targetUser.id,
      },
    });

    return NextResponse.json({ success: true, message: `Project shared with ${username}!` });
  } catch (error: any) {
    console.error("Sharing Error:", error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}