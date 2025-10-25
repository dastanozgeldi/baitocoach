"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

export default function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    recordingState,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const handleRecordingToggle = async () => {
    if (recordingState === "recording") {
      stopRecording();
    } else if (recordingState === "idle") {
      await startRecording();
    }
  };

  // Transcribe audio when recording stops and we have an audio blob
  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
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

      if (data.text) {
        // Append transcribed text to the current input
        const newText = input ? `${input} ${data.text}` : data.text;
        setInput(newText);

        // Update the textarea value
        if (textareaRef.current) {
          textareaRef.current.value = newText;
          textareaRef.current.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        }

        toast.success("Audio transcribed!");
        clearRecording();
      }
    } catch (err) {
      console.error("Transcription error:", err);
      toast.error("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (recordingState === "idle" && audioBlob && !isTranscribing) {
      transcribeAudio(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingState, audioBlob]);

  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
    }
  }, [recordingError]);

  return (
    <div className="mt-4 mx-4 md:mx-0 relative rounded-lg border h-[73vh]">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No messages yet"
                description="Start a conversation to see messages here"
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <PromptInput
        onSubmit={() => {
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="mt-4 w-full relative"
      >
        <PromptInputTextarea
          ref={textareaRef}
          value={input}
          placeholder="How can I help you?"
          onChange={(e) => setInput(e.currentTarget.value)}
          className="pr-12"
        />

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputButton
              onClick={handleRecordingToggle}
              disabled={isTranscribing}
              className={cn(
                "relative transition-all duration-200",
                recordingState === "recording" &&
                  "animate-pulse bg-red-500 text-white hover:bg-red-600"
              )}
            >
              {isTranscribing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mic className="size-4" />
              )}
            </PromptInputButton>
          </PromptInputTools>

          <PromptInputSubmit
            status={status === "streaming" ? "streaming" : "ready"}
            disabled={!input.trim()}
            className="absolute bottom-1 right-1"
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
