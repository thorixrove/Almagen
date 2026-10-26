import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Prisma } from "@/lib/generated/prisma/client";

export function scopeWhere(orgId: string | null | undefined, userId: string): Prisma.WorkspaceWhereInput {
    return orgId ? { clerkOrgId: orgId } : { clerkOrgId: null, creatorId: userId }
}

export async function getWorkspaceScope(userId: string) {
    const { orgId } = await auth()
    const orgName = orgId
        ? (await (await clerkClient()).organizations.getOrganization({ organizationId: orgId })).name
        : "Personal"

    return { orgName, where: scopeWhere(orgId, userId) }
}