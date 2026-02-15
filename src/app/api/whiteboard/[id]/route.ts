import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = (global as any).prisma || new PrismaClient();

// Auto-save logic ke liye PATCH method [cite: 2026-02-15]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data } = await req.json();

    const updated = await prisma.whiteboard.update({
      where: { id },
      data: { 
        data: data,
        updatedAt: new Date() // Timestamp update karna zaroori hai [cite: 2026-02-15]
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH ERROR:", error.message);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

// Data fetch karne ke liye GET method [cite: 2026-02-14]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const whiteboard = await prisma.whiteboard.findUnique({ 
      where: { id },
      // projectId select karna zaroori hai navigation fix ke liye [cite: 2026-02-14]
      select: {
        id: true,
        title: true,
        data: true,
        projectId: true, 
        updatedAt: true
      }
    });

    if (!whiteboard) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(whiteboard);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// Optional: Board delete karne ke liye DELETE method [cite: 2026-02-14]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.whiteboard.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}