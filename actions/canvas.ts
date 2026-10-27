"use server";

import { canAccessWorkspace } from "@/lib/workspace-access";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";


export async function saveCanvasContent(workspaceId: string, content: Prisma.InputJsonValue) {
    if (!(await canAccessWorkspace(workspaceId))) throw new Error("Workspace not found")

    await prisma.canvas.update({

        where: { workspaceId },
        data: { content },
    })
}