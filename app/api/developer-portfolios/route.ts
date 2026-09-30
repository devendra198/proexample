import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { formatUrl } from "@/lib/utils";

export async function GET() {
  try {
    const developers = await prisma.developerPortfolio.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ developers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch developer portfolios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, url, role, sortOrder } = body;

    if (!name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const developer = await prisma.developerPortfolio.create({
      data: {
        name: name.trim(),
        url: formatUrl(url),
        role: role?.trim() || "Developer",
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ developer }, { status: 201 });
  } catch (error) {
    console.error("Failed to create developer portfolio:", error);
    return NextResponse.json({ error: "Failed to create developer portfolio" }, { status: 500 });
  }
}
