"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";

type UpgradeReason = { title: string; description?: string }

const DEFAULT_REASON: UpgradeReason = {
    title: "Upgrade your plan",
    description: "Get more agent prompts, unlimited workspaces, share links and PDF export.",
}

const UpgradeDialogContext = createContext<(reason?: UpgradeReason) => void>(() => { })

export function UpgradeDialogProvider({ children }: { children: ReactNode }) {
    const [reason, setReason] = useState<UpgradeReason | null>(null)
    const close = () => setReason(null)

    return (
        <UpgradeDialogContext.Provider value={(next) => setReason(next ?? DEFAULT_REASON)}>
            {children}
            <Dialog open={reason !== null} onOpenChange={(open) => !open && close()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center">
                        <DialogTitle className="text-2xl">{reason?.title}</DialogTitle>
                        {reason?.description && <DialogDescription>{reason.description}</DialogDescription>}
                    </DialogHeader>
                    <PricingPlans onCheckoutStart={close} />
                </DialogContent>
            </Dialog>
        </UpgradeDialogContext.Provider>
    )
}

export function useUpgradeDialog() {
    return useContext(UpgradeDialogContext)
}
