"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type Recognition = {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
    onend: () => void
    start: () => void
    stop: () => void
    abort: () => void
}

type RecognitionConstructor = new () => Recognition

function getRecognition() {
    const w = window as unknown as Record<string, RecognitionConstructor | undefined>
    return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

const noopSubscribe = () => () => { }
const isSupported = () => getRecognition() !== undefined
const isSupportedOnServer = () => false

export function MicButton({
    value,
    onChange,
    disabled,
    className,
}: {
    value: string
    onChange: (text: string) => void
    disabled?: boolean
    className?: string
}) {
    const supported = useSyncExternalStore(noopSubscribe, isSupported, isSupportedOnServer)
    const [listening, setListening] = useState(false)
    const recognitionRef = useRef<Recognition | null>(null)

    useEffect(() => () => recognitionRef.current?.abort(), [])

    if (!supported) return null

    const toggle = () => {
        if (listening) {
            recognitionRef.current?.stop()
            return
        }
        const Recognition = getRecognition()
        if (!Recognition) return

        const recognition = new Recognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = navigator.language

        const base = value.trim() ? `${value.trim()} ` : ""
        recognition.onresult = (event) => {
            const spoken = Array.from(event.results, (result) => result[0].transcript).join("")
            onChange(base + spoken)
        }
        recognition.onend = () => setListening(false)

        recognitionRef.current = recognition
        recognition.start()
        setListening(true)
    }

    return (
        <Button
            type="button"
            size="icon"
            variant={listening ? "destructive" : "ghost"}
            onClick={toggle}
            disabled={disabled}
            className={className}
            aria-label={listening ? "Stop dictation" : "Dictate"}
            title={listening ? "Stop dictation" : "Dictate"}
        >
            {listening ? <Square className="size-3.5" /> : <Mic className="size-4" />}
        </Button>
    )
}