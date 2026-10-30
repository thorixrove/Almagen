"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentChatPanel } from "./AgentChatPanel";
import { useWorkspaceEditors } from "@/components/WorkspaceEditorsContext";
import { useWorkspaceAgentChat } from "@/hooks/use-workspace-agent-chat";

export function AgentToggleButton({ workspaceId, initialPrompt }: { workspaceId: string; initialPrompt?: string }) {
    const [isOpen, setIsOpen] = useState(!!initialPrompt)
    const { canvasEditor, docEditor } = useWorkspaceEditors()
    const chat = useWorkspaceAgentChat(workspaceId, { canvasEditor, docEditor })
    const router = useRouter()
    const pathname = usePathname()
    const promptSent = useRef(false)


    useEffect(() => {
        if (!initialPrompt || promptSent.current || !canvasEditor || !docEditor) return
        promptSent.current = true
        chat.sendMessage({ text: initialPrompt })
        router.replace(pathname, { scroll: false })
    }, [initialPrompt, canvasEditor, docEditor, chat, router, pathname])

    return (
        <>
        <Button size="sm" className="gap-1.5" onClick={() => setIsOpen((v) => !v)}>
            {isOpen ? (
                <>
                <X className="size-4">
                    Close
                </X>
                </>
            ): (
                <>
                <Sparkles className="size-4"/>
                Ask Agent
                </>
            )}
        </Button>
        {isOpen && <AgentChatPanel chat={chat} isReady={!!canvasEditor || !!docEditor}/>}
        </>
    )
}