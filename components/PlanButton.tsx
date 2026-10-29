"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getActivePromptUsage } from "@/actions/usage";
import { useUpgradeDialog } from "@/components/UpgradeDialog";



type Usage = Awaited<ReturnType<typeof getActivePromptUsage>>

const USAGE_CHANGED_EVENT = "almagen:prompt-usage-changed"

export function refreshPromptUsage() {
    window.dispatchEvent(new Event(USAGE_CHANGED_EVENT))
}

export function PlanButton({ upgradeOnlyWhenOut = false }: { upgradeOnlyWhenOut?: boolean }) {
    const { orgId } = useAuth()
    const [usage, setUsage] = useState<Usage>(null)
    const openUpgrade = useUpgradeDialog()

    useEffect(() => {
        let cancelled = false
        const load = () => getActivePromptUsage().then((next) => !cancelled && setUsage(next))
        load()
        window.addEventListener(USAGE_CHANGED_EVENT, load)
        return () => {
            cancelled = true
            window.removeEventListener(USAGE_CHANGED_EVENT, load)
        }
    }, [orgId])

    if (!usage) return null

    const { used, limit, isPaid } = usage
    const isOut = used >= limit

    const upgrade = () =>
        openUpgrade({
            title: isOut ? "You're out of agent prompts" : "Get more agent prompts",
            description: `You've used ${used} of ${limit} prompts this month. Upgrade for more.`,
        })

    return (
        <div className="flex h-8 items-center overflow-hidden rounded-full border border-white/10 bg-white/3 text-xs">
            <button
                type="button"
                title={`${used.toLocaleString()} of ${limit.toLocaleString()} agent prompts used this month`}
                onClick={isPaid ? undefined : upgrade}
                className="flex h-full items-center gap-2.5 px-3 transition-colors hover:bg-white/5"
            >
                <span>{isPaid ? "Pro" : "Free"}</span>
                <span className="h-1 w-12 overflow-hidden rounded-full bg-white/10">
                    <span
                        className={`block h-full rounded-full ${isOut ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                    />
                </span>
                <span className="text-muted-foreground tabular-nums">
                    {used.toLocaleString()}/{limit.toLocaleString()}
                </span>
            </button>
            {!isPaid && (!upgradeOnlyWhenOut || isOut) && (
                <button
                    type="button"
                    onClick={upgrade}
                    className="h-full border-l border-white/10 px-3 font-medium text-primary transition-colors hover:bg-primary/10"
                >
                    Upgrade
                </button>
            )}
        </div>
    )
}