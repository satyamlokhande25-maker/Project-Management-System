import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = (global as any).prisma || new PrismaClient();

// 1. Projects Fetch karne ke liye (Aapka Purana Code)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { shares: { some: { userId: userId } } } 
        ]
      },
      include: { 
        whiteboards: true,
        owner: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// 2. Naya Project Create karne ke liye (Yahi Missing Tha)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, ownerId } = body;

    if (!name || !ownerId) {
      return NextResponse.json({ error: "Name and ownerId are required" }, { status: 400 });
    }

    // Database mein entry create karna
    const newProject = await prisma.project.create({
      data: {
        name: name,
        ownerId: ownerId, // Humne database mein 'satyam' ki ID '1' rakhi hai, wahi yahan aayegi
      },
    });

    return NextResponse.json(newProject);
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json({ error: "Project creation failed" }, { status: 500 });
  }
}