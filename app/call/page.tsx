"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Phone, Copy, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateResponse } from "@/app/actions/generate-response";
import { transcribeAudio } from "@/app/actions/transcribe";

interface ConversationEntry {
  id: string;
  japanese: string;
  english: string;
  timestamp: number;
  type: "business" | "user";
}

interface SuggestedResponse {
  japanese: string;
  romaji: string;
  english: string;
}

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [conversationHistory, setConversationHistory] = useState<
    ConversationEntry[]
  >([]);
  const [currentSuggestion, setCurrentSuggestion] =
    useState<SuggestedResponse | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    recordingState,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
    }
  }, [recordingError]);

  // Transcribe and generate response when recording stops
  const transcribeAndGenerateResponse = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      // Step 1: Transcribe the audio
      const transcriptionData = await transcribeAudio(blob);

      if (!transcriptionData.text || !transcriptionData.text.trim()) {
        toast.error("No speech detected. Please try again.");
        clearRecording();
        return;
      }

      // Step 2: Add to conversation history
      const businessEntry: ConversationEntry = {
        id: `business-${Date.now()}`,
        japanese: transcriptionData.text,
        english: "",
        timestamp: Date.now(),
        type: "business",
      };

      setConversationHistory((prev) => [...prev, businessEntry]);
      setIsTranscribing(false);

      // Step 3: Generate response suggestion
      setIsGeneratingResponse(true);
      const suggestion = await generateResponse(
        transcriptionData.text,
        session?.user?.id || ""
      );
      setCurrentSuggestion(suggestion);

      // Update conversation entry with English translation
      setConversationHistory((prev) =>
        prev.map((entry) =>
          entry.id === businessEntry.id
            ? { ...entry, english: suggestion.english }
            : entry
        )
      );

      toast.success("Response generated!");
      clearRecording();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to process audio. Please try again.");
    } finally {
      setIsTranscribing(false);
      setIsGeneratingResponse(false);
    }
  };

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (recordingState === "idle" && audioBlob && !isTranscribing) {
      transcribeAndGenerateResponse(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingState, audioBlob]);

  const handleRecordingToggle = async () => {
    if (recordingState === "recording") {
      stopRecording();
    } else if (recordingState === "idle") {
      await startRecording();
    }
  };

  const handleCopyResponse = () => {
    if (currentSuggestion) {
      navigator.clipboard.writeText(currentSuggestion.japanese);
      toast.success("Response copied to clipboard");
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="size-6" />
            <div>
              <CardTitle className="text-xl">Call Assistant</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    recordingState === "recording" ? "default" : "outline"
                  }
                  className={cn(
                    recordingState === "recording" &&
                      "bg-red-500 hover:bg-red-600 animate-pulse"
                  )}
                >
                  {recordingState === "recording" ? (
                    <>
                      <Mic className="size-3 mr-1" />
                      RECORDING
                    </>
                  ) : (
                    <>
                      <MicOff className="size-3 mr-1" />
                      READY
                    </>
                  )}
                </Badge>
                {(isTranscribing || isGeneratingResponse) && (
                  <Badge variant="outline">
                    <Loader2 className="size-3 mr-1 animate-spin" />
                    {isTranscribing
                      ? "Transcribing..."
                      : "Generating response..."}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleRecordingToggle}
            disabled={isTranscribing || isGeneratingResponse}
            size="lg"
            variant={recordingState === "recording" ? "destructive" : "default"}
            className={cn(recordingState === "recording" && "animate-pulse")}
          >
            {recordingState === "recording" ? (
              <>
                <MicOff className="size-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="size-4" />
                Start Recording
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Conversation History */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {conversationHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Phone className="size-12 mx-auto mb-3 opacity-20" />
                    <p>Conversation will appear here</p>
                    <p className="text-sm mt-1">
                      Start listening to begin transcription
                    </p>
                  </div>
                ) : (
                  conversationHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="border-l-4 border-blue-500 pl-4 py-2 bg-muted/30 rounded-r"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Business Owner
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-lg font-medium mb-1">
                        {entry.japanese}
                      </p>
                      {entry.english && (
                        <p className="text-sm text-muted-foreground">
                          → {entry.english}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Response */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Suggested Response
                {isGeneratingResponse && (
                  <Loader2 className="size-4 animate-spin" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!currentSuggestion ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="size-12 mx-auto mb-3 opacity-20" />
                  <p>Waiting for business owner to speak...</p>
                  <p className="text-sm mt-1">
                    Response suggestions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Japanese */}
                  <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
                    <p className="text-2xl font-bold text-center mb-2">
                      {currentSuggestion.japanese}
                    </p>
                  </div>

                  {/* Romaji */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      PRONUNCIATION
                    </p>
                    <p className="text-lg font-medium italic">
                      {currentSuggestion.romaji}
                    </p>
                  </div>

                  {/* English */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      ENGLISH
                    </p>
                    <p className="text-base">{currentSuggestion.english}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyResponse}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="size-4 mr-2" />
                      Copy Response
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Button className="self-end" onClick={() => signOut()}>Sign Out</Button>
      </div>
    </div>
  );
}
