import { max } from "date-fns";
import type { WorkspaceStatus } from "@/lib/generated/prisma/enums";

// Board columns, in order. Shared by the kanban board and the recent workspace cards.
export const WORKSPACE_STATUSES: { status: WorkspaceStatus; title: string }[] = [
    { status: "PLANNING", title: "Planning" },
    { status: "IN_PROGRESS", title: "In progress" },
    { status: "IN_REVIEW", title: "In review" },
    { status: "DONE", title: "Done" },
];

export function statusTitle(status: WorkspaceStatus) {
    return WORKSPACE_STATUSES.find((s) => s.status === status)?.title ?? status
}



export const workspaceCardSelect = {
    id: true,
    name: true,
    description: true,
    status: true,
    updateAt: true,
    creator: { select: { name: true, imageUrl: true } },
    doc: { select: { updateAt: true } },
    canvas: { select: { updateAt: true } }
} as const

type Dated = { updateAt: Date } | null


export function withLastActivity<T extends { updateAt: Date; doc: Dated; canvas: Dated }>(workspace: T) {
    const lastActivity = max([workspace.updateAt, workspace.doc?.updateAt ?? 0, workspace.canvas?.updateAt ?? 0])
    return { ...workspace, lastActivity }
}
