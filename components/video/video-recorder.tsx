"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MAX_VIDEO_DURATION_SECONDS } from "@/lib/constants";

interface VideoRecorderProps {
  onRecorded: (blob: Blob, durationSeconds: number) => void;
}

export function VideoRecorder({ onRecorded }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<"idle" | "preview" | "recording" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("preview");
    } catch {
      setError("Camera access denied. Please allow camera and microphone access.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setSeconds(0);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      stopCamera();
      setState("done");
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setState("recording");

    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_VIDEO_DURATION_SECONDS) {
          recorder.stop();
          if (timerRef.current) clearInterval(timerRef.current);
          return s + 1;
        }
        return s + 1;
      });
    }, 1000);
  }, [stopCamera]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reRecord = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setState("idle");
  }, [recordedUrl]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [stopCamera, recordedUrl]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center">
        <p className="text-sm text-danger">{error}</p>
        <Button variant="secondary" onClick={() => { setError(""); startCamera(); }} className="mt-3">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-black aspect-[4/3]">
        {state === "idle" && (
          <div className="flex h-full items-center justify-center">
            <Button onClick={startCamera}>Open Camera</Button>
          </div>
        )}

        {(state === "preview" || state === "recording") && (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        )}

        {state === "done" && recordedUrl && (
          <video src={recordedUrl} controls playsInline className="h-full w-full object-cover" />
        )}

        {state === "recording" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-danger px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-medium text-white">{formatTime(seconds)}</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-text-secondary">
        {state === "idle" && "Record a short video describing your symptoms (max 3 minutes)"}
        {state === "preview" && "Camera ready — press record when you're ready"}
        {state === "recording" && "Recording... describe your symptoms clearly"}
        {state === "done" && "Review your video, then submit or re-record"}
      </p>

      <div className="flex gap-3">
        {state === "preview" && (
          <Button onClick={startRecording} className="flex-1" size="lg">
            Record
          </Button>
        )}
        {state === "recording" && (
          <Button onClick={stopRecording} variant="danger" className="flex-1" size="lg">
            Stop Recording
          </Button>
        )}
        {state === "done" && (
          <>
            <Button variant="secondary" onClick={reRecord} className="flex-1">
              Re-record
            </Button>
            <Button
              onClick={() => recordedBlob && onRecorded(recordedBlob, seconds)}
              className="flex-1"
            >
              Use This Video
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
