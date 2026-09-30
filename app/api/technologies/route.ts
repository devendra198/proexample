import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { technologySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (!includeInactive && !status) {
      where.status = "ACTIVE";
    } else if (status) {
      where.status = status;
    }

    const technologies = await prisma.technology.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    return NextResponse.json({ technologies });
  } catch (error) {
    console.error("Failed to fetch technologies:", error);
    return NextResponse.json({ error: "Failed to fetch technologies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = technologySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, categoryId, description, status, sortOrder } = result.data;

    // Check slug uniqueness
    const existing = await prisma.technology.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A technology with this slug already exists" },
        { status: 409 }
      );
    }

    const technology = await prisma.technology.create({
      data: {
        name,
        slug,
        categoryId,
        description: description || null,
        status,
        sortOrder: sortOrder || 0,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ technology }, { status: 201 });
  } catch (error) {
    console.error("Failed to create technology:", error);
    return NextResponse.json({ error: "Failed to create technology" }, { status: 500 });
  }
}
