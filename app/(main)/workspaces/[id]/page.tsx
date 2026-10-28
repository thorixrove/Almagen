import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { TLEditorSnapshot } from "tldraw";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-access";
import { WorkspaceEditorsProvider } from "@/components/WorkspaceEditorsContext";
import { EditableWorkspaceName } from "./_components/EditableWorkspaceName";
import { CanvasEditor } from "./_components/CanvasEditor";


export default async function WorkspacePage({ params }: PageProps<"/workspaces/[id]">) {
    const { id } = await params

    if (!(await canAccessWorkspace(id))) notFound()

    const workspace = await prisma.workspace.findUnique({
        where: { id },
        select: { name: true, canvas: { select: { content: true } } }
    })
    if (!workspace) notFound()

    return (
        <WorkspaceEditorsProvider>
            <div className="flex h-dvh flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/6 bg-background px-4">
                    <Link
                        href="/dashboard"
                        aria-label="Kembali ke dashboard"
                        className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <EditableWorkspaceName workspaceId={id} initialName={workspace.name} />
                </header>

                <div className="flex-1">
                    <CanvasEditor workspaceId={id} initialSnapshot={workspace.canvas?.content as TLEditorSnapshot | null} />
                </div>
            </div>
        </WorkspaceEditorsProvider>
    )
}