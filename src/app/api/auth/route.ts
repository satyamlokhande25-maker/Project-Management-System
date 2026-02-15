import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    let user = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}