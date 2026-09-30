import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const categoryId = searchParams.get("categoryId");
    const categorySlug = searchParams.get("categorySlug");
    const technologyId = searchParams.get("technologyId");
    const technologySlug = searchParams.get("technologySlug");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const includeAll = searchParams.get("includeAll") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const where: any = {};

    // Public defaults to ACTIVE projects only
    if (!includeAll) {
      where.status = "ACTIVE";
    } else if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (technologyId) {
      where.technologyId = technologyId;
    }
    if (technologySlug) {
      where.technology = { slug: technologySlug };
    }
    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { technology: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      take: limit,
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        technology: {
          select: { id: true, name: true, slug: true },
        },
        links: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ projects, count: projects.length });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const finalSlug = (data.slug?.trim() || slugify(data.name)) + "-" + Math.random().toString(36).substring(2, 6);
    let finalUrl = data.projectUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    // Create project along with links
    const project = await prisma.project.create({
      data: {
        name: data.name,
        slug: finalSlug,
        categoryId: data.categoryId,
        technologyId: data.technologyId,
        shortDescription: data.shortDescription?.trim() || data.name,
        description: data.description?.trim() || data.name,
        projectUrl: finalUrl,
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

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
