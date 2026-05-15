"use client";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@repo/share-ui/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@repo/share-ui/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@repo/share-ui/components/ai-elements/prompt-input";
import { Shimmer } from "@repo/share-ui/components/ai-elements/shimmer";
import { Button } from "@repo/share-ui/components/reui/button";
import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { RotateCcwIcon, SparklesIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { MessageParts } from "./message-parts";
import { AutoSuggestions } from "./message-parts/auto-suggestions";

export default function ApprovalAgentTest() {
  const { messages, sendMessage, addToolApprovalResponse, status, setMessages } = useChat<UIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/agents/approval",
    }),
    sendAutomaticallyWhen: (args) =>
      lastAssistantMessageIsCompleteWithToolCalls(args) || lastAssistantMessageIsCompleteWithApprovalResponses(args),
  });

  // ─── 处理用户手动输入发送 ─────────────────────────────────────────────────

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim() || status === "streaming" || status === "submitted") return;
      sendMessage({ text });
    },
    [status, sendMessage],
  );

  // ─── 重置对话 ──────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  // ─── 状态判断 ──────────────────────────────────────────────────────────────────

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  const lastMessage = messages[messages.length - 1];
  const isWaitingForApproval =
    !isStreaming &&
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((part) => isToolUIPart(part) && part.state !== "output-available");

  // ─── 渲染 ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部标题栏 */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <span className="font-medium text-sm">AI Agent</span>
        </div>
        <Button size="icon-sm" variant="ghost" onClick={handleReset} aria-label="清空对话" disabled={isLoading}>
          <AiOutlineClear className="size-4" />
        </Button>
      </div>
      {/* 对话区 */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<SparklesIcon className="size-10" />}
              title="AI Agent 测试"
              description="描述你的需求，规划。"
            />
          )}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                <MessageParts
                  addToolApprovalResponse={addToolApprovalResponse}
                  message={message}
                  isLastMessage={message === messages[messages.length - 1]}
                  isStreaming={isStreaming}
                />
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      {/* 输入区 */}
      <div className="shrink-0 border-t p-3">
        {isStreaming ? (
          <div className="mb-3 flex items-center text-sm text-muted-foreground">
            <ImSpinner2 className="animate-spin mr-2" />{" "}
            <Shimmer className="block text-sm text-muted-foreground"> AI 正在处理...</Shimmer>
          </div>
        ) : isWaitingForApproval ? null : (
          <AutoSuggestions messages={messages} onSelectSuggestion={handleSend} />
        )}
        <PromptInput
          onSubmit={({ text }) => {
            if (text.trim()) handleSend(text);
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea placeholder="向 AI Agent 提问，或描述需求…" disabled={isLoading} />
          </PromptInputBody>
          <PromptInputFooter>
            <span className="text-muted-foreground text-xs">Enter 发送</span>
            <PromptInputSubmit status={status} onStop={() => void 0} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
