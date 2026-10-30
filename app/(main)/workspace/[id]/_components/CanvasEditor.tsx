"use client";

import { useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Tldraw,
    atom,
    computed,
    createTLCurrentUser,
    createUserId,
    getUserPreferences,
    UserRecordType,
    DefaultToolbar,
    DefaultToolbarContent,
    inlineBase64AssetStore,
    defaultShapeUtils,
    defaultBindingUtils,
    type Editor,
    type TLEditorSnapshot,
    type TLComponents,
} from "tldraw";
import { useSync, useSyncDemo } from "@tldraw/sync";
import "tldraw/tldraw.css";
import { saveCanvasContent } from "@/actions/canvas";
import type { Prisma } from "@/lib/generated/prisma/client";
import { EntityTableShapeUtil } from "@/components/EntityTable/EntityTableShapeUtil";
import { AddEntityTableButton } from "@/components/EntityTable/AddEntityTableButton";
import { snapArrowBindingToRow } from "@/components/EntityTable/snapArrowToRow";
import { useWorkspaceEditors } from "@/components/WorkspaceEditorsContext";
import { colorForUser } from "@/lib/utils";


const SAVE_DEBOUNCE_MS = 1000;

const shapeUtils = [EntityTableShapeUtil];

// Our own sync server (the tldraw-sync/ Cloudflare Worker). Without it, tldraw's public demo
// server is used: fine for trying things out, but rooms there are public and get wiped.
const SYNC_URL = process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL;

// Unlike useSyncDemo, useSync doesn't add tldraw's built-in shapes itself. Built once here:
// a new array on every render would make useSync rebuild the store in a loop.
const syncShapeUtils = [...defaultShapeUtils, ...shapeUtils];

type SyncOptions = { roomId: string; users?: Parameters<typeof useSyncDemo>[0]["users"] };

const useCanvasSync = SYNC_URL
    ? ({ roomId, users }: SyncOptions) =>
        useSync({
            uri: `${SYNC_URL}/connect/${roomId}`,
            assets: inlineBase64AssetStore,
            shapeUtils: syncShapeUtils,
            bindingUtils: defaultBindingUtils,
            users,
        }) : ({ roomId, users }: SyncOptions) => useSyncDemo({ roomId, shapeUtils, users })

const components: TLComponents = {
    StylePanel: null,
    PageMenu: null,
    MainMenu: null,
    Toolbar: () => {
        <DefaultToolbar orientation="vertical">
            <AddEntityTableButton />
            <DefaultToolbarContent />
        </DefaultToolbar>
    }
}

export function CanvasEditor({
    workspaceId,
    initialSnapshot,
}: {
    workspaceId: string
    initialSnapshot: TLEditorSnapshot | null
}) {
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { setCanvasEditor } = useWorkspaceEditors()
    const { user } = useUser()

    const userId = user?.id
    const userName = user?.fullName ?? user?.username ?? "Anonymous"
    const userImageUrl = user?.imageUrl ?? ""
    const users = useMemo(() => {
        if (!userId) return undefined
        return {
            currentUser: atom(
                "currentUser",
                UserRecordType.create({
                    id: createUserId(userId),
                    name: userName,
                    color: colorForUser(userId),
                    imageUrl: userImageUrl,
                })
            )
        }
    }, [userId, userName, userImageUrl])

    const currentUser = useMemo(() => {
        if (!userId) return undefined
        return createTLCurrentUser({
            userPreferences: computed("clerkUserPreferences", () => ({
                ...getUserPreferences(),
                id: userId,
                name: userName,
                color: colorForUser(userId)
            }))
        })
    }, [userId, userName])

    const store = useCanvasSync({ roomId: `almagen-${workspaceId}`, users })

    const handleMount = (editor: Editor) => {
        setCanvasEditor(editor)
        if (initialSnapshot && editor.getCurrentPageShapeIds().size === 0) {
            editor.loadSnapshot(initialSnapshot)
        }

        editor.store.listen(
            () => {
                if (saveTimeout.current) clearTimeout(saveTimeout.current)
                saveTimeout.current = setTimeout(() => {
                    const plainSnapshot = JSON.parse(
                        JSON.stringify(editor.getSnapshot())
                    ) as Prisma.InputJsonValue
                    saveCanvasContent(workspaceId, plainSnapshot)
                }, SAVE_DEBOUNCE_MS)
            },
            { source: "user", scope: "document" }
        )

        editor.store.listen(
            (entry) => {
                for (const record of Object.values(entry.changes.added)) {
                    if (record.typeName === "binding" && record.type === "arrow") {
                        snapArrowBindingToRow(editor, record)
                    }
                }
            },
            { source: "user", scope: "all" }
        )

        return () => setCanvasEditor(null)
    }

    return (
        <div>
            <Tldraw
                store={store}
                user={currentUser}
                onMount={handleMount}
                components={components}
                colorScheme="dark"
                shapeUtils={shapeUtils}
                licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
            />
        </div>
    )
}