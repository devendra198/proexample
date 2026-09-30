import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { technologySchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technology = await prisma.technology.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!technology) {
      return NextResponse.json({ error: "Technology not found" }, { status: 404 });
    }

    return NextResponse.json({ technology });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch technology" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.technology.findUnique({
      where: { slug },
    });
    if (existing && existing.id !== params.id) {
      return NextResponse.json(
        { error: "Another technology already uses this slug" },
        { status: 409 }
      );
    }

    const updated = await prisma.technology.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        categoryId,
        description: description || null,
        status,
        sortOrder,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ technology: updated });
  } catch (error) {
    console.error("Failed to update technology:", error);
    return NextResponse.json({ error: "Failed to update technology" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tech = await prisma.technology.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: "Technology not found" }, { status: 404 });
    }

    const force = new URL(req.url).searchParams.get("force") === "true";

    if (tech._count.projects > 0 && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete technology. It currently has ${tech._count.projects} projects linked to it. Please reassign or delete these projects first, or confirm force delete.`,
          hasDependencies: true,
          projectsCount: tech._count.projects,
        },
        { status: 400 }
      );
    }

    if (force) {
      await prisma.project.deleteMany({
        where: { technologyId: params.id },
      });
    }

    await prisma.technology.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Technology deleted successfully" });
  } catch (error) {
    console.error("Failed to delete technology:", error);
    return NextResponse.json({ error: "Failed to delete technology" }, { status: 500 });
  }
}
