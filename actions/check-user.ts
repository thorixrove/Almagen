"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function checkUser() {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const existing = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id }
    })

    if (existing) return existing

    const email = clerkUser.emailAddresses[0]?.emailAddress
    console.log("[checkuser] email", email)
    if (!email) return null

    try {
        const created = await prisma.user.create({
            data: {
                clerkId: clerkUser.id,
                email,
                name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
                imageUrl: clerkUser.imageUrl,
            }
        })
        console.log("[checkUser] created:", created.id)
        return created
    } catch (e) {
        console.error("[checkUser] GAGAL create:", e)
        throw e
    }
}