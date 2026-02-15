import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Development mein multiple connections se bachne ke liye global instance
const prisma = (global as any).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (global as any).prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID missing" }, { status: 400 });
    }

    // TLDraw ko ek basic structure chahiye hota hai initial load ke liye
    const initialTLDrawState = {
      schema: { schemaVersion: 1, storeVersion: 4, recordVersions: {} },
      records: []
    };

    const newBoard = await prisma.whiteboard.create({
      data: {
        title: title || "New Drawing",
        projectId: projectId,
        data: initialTLDrawState, // Sahi initial structure [cite: 2026-02-15]
      },
    });

    return NextResponse.json(newBoard);
  } catch (error: any) {
    console.error("PRISMA ERROR:", error.message);
    return NextResponse.json({ error: "Failed", details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    
    if (!projectId) return NextResponse.json([]);

    const whiteboards = await prisma.whiteboard.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    });
    
    return NextResponse.json(whiteboards);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json([]);
  }
}