import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = (global as any).prisma || new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Project ID
    const { email } = await req.json(); // Ye wo username hai jo aapne modal mein dala

    if (!email) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // 1. Pehle us user ko dhoondo jiske saath share karna hai
    const targetUser = await prisma.user.findUnique({
      where: { username: email } 
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found! Make sure the username is correct." }, { status: 404 });
    }

    // 2. ProjectShare table mein entry dalo
    const newShare = await prisma.projectShare.create({
      data: {
        projectId: id,
        userId: targetUser.id // Yahan schema ki 'userId' use ho rahi hai
      }
    });

    return NextResponse.json({ message: "Shared successfully!" });
  } catch (error: any) {
    // Unique constraint error: Agar pehle se shared hai
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "This project is already shared with this user." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Sharing failed on server" }, { status: 500 });
  }
}

// DELETE function ko bhi update kar dete hain schema ke hisaab se
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Schema ke relations ke mutabiq sab saaf karo
    await prisma.projectShare.deleteMany({ where: { projectId: id } });
    await prisma.whiteboard.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id: id } });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}