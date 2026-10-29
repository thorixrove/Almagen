import * as Y from "yjs";
import {
    Awareness,
    applyAwarenessUpdate,
    encodeAwarenessUpdate,
    removeAwarenessStates,
} from "y-protocols/awareness";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fromBase64, toBase64 } from "@/lib/base64";

const PEER_SYNC_WAIT_MS = 500;


export class SupabaseYjsProvider {
    readonly awareness: Awareness
    private channel: RealtimeChannel
    private subscribed = false
    private isReady = false
    private readyTimeout?: ReturnType<typeof setTimeout>

    constructor(
        private doc: Y.Doc,
        roomId: string,
        private onReady: () => void
    ) {
        this.awareness = new Awareness(doc)
        this.channel = supabase.channel(`doc:${roomId}`, { config: { broadcast: { self: false } } })


        this.channel
            .on("broadcast", { event: "update" }, ({ payload }) => {
                Y.applyUpdate(this.doc, fromBase64(payload.update), this)
            })
            .on("broadcast", { event: "awareness" }, ({ payload }) => {
                applyAwarenessUpdate(this.awareness, fromBase64(payload.update), this)
            })
            .on("broadcast", { event: "sync-request" }, () => {
                this.sendFullState()
            })
            .subscribe((status) => {
                if (status !== "SUBSCRIBED") {
                    this.subscribed = false
                    this.markReady()
                    return
                }
                this.subscribed = true
                this.sendFullState()
                this.send("sync-request", {})
                this.readyTimeout ??= setTimeout(this.markReady, PEER_SYNC_WAIT_MS)
            })

        this.doc.on("update", this.handleDocUpdate)
        this.awareness.on("update", this.handleAwarenessUpdate)
    }

    private handleDocUpdate = (update: Uint8Array, origin: unknown) => {
        if (origin !== this) this.send("update", { update: toBase64(update) })
    }

    private handleAwarenessUpdate = (
        { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown
    ) => {
        if (origin === this) return
        const changed = [...added, ...updated, ...removed]
        this.send("awarness", { update: toBase64(encodeAwarenessUpdate(this.awareness, changed)) })
    }

    private markReady = () => {
        clearTimeout(this.readyTimeout)
        if (this.isReady) return
        this.isReady = true
        this.onReady
    }

    private sendFullState() {
        this.send("update", { update: toBase64(Y.encodeStateAsUpdate(this.doc)) })
        this.send("awarness", {
            update: toBase64(encodeAwarenessUpdate(this.awareness, [this.doc.clientID]))
        })
    }

    private send(event: string, payload: Record<string, unknown>) {
        if (!this.subscribed) return
        this.channel.send({ type: "broadcast", event, payload })
    }

    destroy() {
        clearTimeout(this.readyTimeout)
        this.isReady = true
        removeAwarenessStates(this.awareness, [this.doc.clientID], "destroy")
        this.doc.off("update", this.handleDocUpdate)
        this.awareness.off("update", this.handleAwarenessUpdate)
        this.awareness.destroy()
        supabase.removeChannel(this.channel)
    }
}