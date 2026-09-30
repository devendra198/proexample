import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        technology: true,
        links: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
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
    const result = projectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Slug conflict check
    const existing = await prisma.project.findUnique({
      where: { slug: data.slug },
    });
    if (existing && existing.id !== params.id) {
      return NextResponse.json(
        { error: "Another project with this slug already exists" },
        { status: 409 }
      );
    }

    // Update project with transaction to update links
    const updated = await prisma.$transaction(async (tx) => {
      // Delete old links
      await tx.projectLink.deleteMany({
        where: { projectId: params.id },
      });

      // Update project and create new links
      return tx.project.update({
        where: { id: params.id },
        data: {
          name: data.name,
          slug: data.slug,
          categoryId: data.categoryId,
          technologyId: data.technologyId,
          shortDescription: data.shortDescription,
          description: data.description,
          projectUrl: data.projectUrl,
          appStoreUrl: data.appStoreUrl || null,
          playStoreUrl: data.playStoreUrl || null,
          githubUrl: data.githubUrl || null,
          imageUrl: data.imageUrl || null,
          featured: data.featured,
          status: data.status,
          sortOrder: data.sortOrder,
          links: {
            create: (data.links || []).map((link, idx) => ({
              label: link.label,
              url: link.url,
              sortOrder: idx + 1,
            })),
          },
        },
        include: {
          category: true,
          technology: true,
          links: true,
        },
      });
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
