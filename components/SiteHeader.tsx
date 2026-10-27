"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton, OrganizationSwitcher, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";


export function SiteHeader() {
    const pathname = usePathname()
    const { isSignedIn } = useAuth()
    const isLandingPage = pathname === "/"

    return (
        <header className="fixed inset-x-0 top-0 z-20 flex h-18 items-center justify-between border-b border-white/6 bg-background/70 px-6 backdrop-blur-md md:px-10">
            <Link
                href={isSignedIn && !isLandingPage ? "/dashboard" : "/"}
                className="font-heading text-xl font-bold tracking-tight"
            >
                Almagen
            </Link>
            <div className="flex items-center gap-3">
                <Show when="signed-out">
                    <SignInButton mode="modal">
                        <Button variant="ghost" size="sm">Masuk</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <Button size="sm">Mulai</Button>
                    </SignUpButton>
                </Show>
                <Show when="signed-in">
                    <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" afterSelectOrganizationUrl="/dashboard" />
                    {isLandingPage ? (
                        <Button asChild size="sm">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/workspaces">Workspaces</Link>
                        </Button>
                    )}
                    <UserButton />
                </Show>
            </div>
        </header>
    )
}