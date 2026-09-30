import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { technologies: true, projects: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
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
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, description, status, sortOrder } = result.data;

    // Slug conflict check with other categories
    const existing = await prisma.category.findUnique({
      where: { slug },
    });
    if (existing && existing.id !== params.id) {
      return NextResponse.json(
        { error: "Another category already uses this slug" },
        { status: 409 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description: description || null,
        status,
        sortOrder,
      },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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

    // Check if category has associated technologies or projects
    const counts = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { technologies: true, projects: true },
        },
      },
    });

    if (!counts) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const force = new URL(req.url).searchParams.get("force") === "true";

    if ((counts._count.technologies > 0 || counts._count.projects > 0) && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete category. It currently contains ${counts._count.technologies} technologies and ${counts._count.projects} projects. Please reassign or delete them first, or confirm force delete.`,
          hasDependencies: true,
          technologiesCount: counts._count.technologies,
          projectsCount: counts._count.projects,
        },
        { status: 400 }
      );
    }

    // If force delete is explicitly confirmed, cascade delete projects
    if (force) {
      await prisma.project.deleteMany({
        where: { categoryId: params.id },
      });
      await prisma.technology.deleteMany({
        where: { categoryId: params.id },
      });
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
