import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = (global as any).prisma || new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    // Logic: Wo projects laao jahan user Owner hai YA jahan project uske saath Share hua hai
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { shares: { some: { userId: userId } } } 
        ]
      },
      include: { 
        whiteboards: true,
        owner: { select: { username: true } } // Taaki pata chale project kiska hai
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// POST function (Create Project) wahi rehne dena jo pehle fixed kiya tha