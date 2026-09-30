import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { formatUrl } from "@/lib/utils";

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
    const { name, url, role, sortOrder } = body;

    if (!name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const updated = await prisma.developerPortfolio.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        url: formatUrl(url),
        role: role?.trim() || "Developer",
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ developer: updated });
  } catch (error) {
    console.error("Failed to update developer portfolio:", error);
    return NextResponse.json({ error: "Failed to update developer portfolio" }, { status: 500 });
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

    await prisma.developerPortfolio.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Developer portfolio deleted" });
  } catch (error) {
    console.error("Failed to delete developer portfolio:", error);
    return NextResponse.json({ error: "Failed to delete developer portfolio" }, { status: 500 });
  }
}
