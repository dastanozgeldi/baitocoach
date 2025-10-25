import { useState, useRef, useCallback } from "react";

export type ContinuousRecordingState = "idle" | "listening" | "paused";

export interface TranscriptionResult {
  text: string;
  timestamp: number;
}

export function useContinuousRecorder() {
  const [recordingState, setRecordingState] =
    useState<ContinuousRecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onTranscriptionRef = useRef<((result: TranscriptionResult) => void) | null>(null);

  const processAudioChunk = useCallback(async () => {
    if (chunksRef.current.length === 0) return;

    setIsProcessing(true);
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = []; // Clear chunks after creating blob

      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        // Call the callback with transcription result
        if (onTranscriptionRef.current) {
          onTranscriptionRef.current({
            text: data.text,
            timestamp: Date.now(),
          });
        }
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const startListening = useCallback(
    async (onTranscription: (result: TranscriptionResult) => void) => {
      try {
        setError(null);
        onTranscriptionRef.current = onTranscription;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });

        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4",
        });

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Start recording with timeslice to get data periodically
        mediaRecorder.start(1000); // Request data every second
        setRecordingState("listening");

        // Process chunks every 3 seconds
        intervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.requestData(); // Force data event
            processAudioChunk();
          }
        }, 3000);
      } catch (err) {
        setError("Failed to access microphone. Please check permissions.");
        console.error("Recording error:", err);
      }
    },
    [processAudioChunk]
  );

  const pauseListening = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "listening") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [recordingState]);

  const resumeListening = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("listening");

      // Restart the interval
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.requestData();
          processAudioChunk();
        }
      }, 3000);
    }
  }, [recordingState, processAudioChunk]);

  const stopListening = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    setRecordingState("idle");
    onTranscriptionRef.current = null;
  }, []);

  return {
    recordingState,
    isProcessing,
    error,
    startListening,
    pauseListening,
    resumeListening,
    stopListening,
  };
}

