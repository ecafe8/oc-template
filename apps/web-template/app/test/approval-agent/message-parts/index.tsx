import { Message, MessageContent, MessageResponse } from "@repo/share-ui/components/ai-elements/message";

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@repo/share-ui/components/ai-elements/reasoning";
import { type DynamicToolUIPart, getToolName, isToolUIPart, type ToolUIPart, type UIMessage } from "ai";
import { ConfirmationCommon } from "./confirmation-common";
import { ToolRenderer } from "./tool-renderer";

export type AnyToolPart = ToolUIPart | DynamicToolUIPart;

export const MessageParts = ({
  message,
  isLastMessage,
  isStreaming,
  addToolApprovalResponse,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
  addToolApprovalResponse: (response: { id: string; approved: boolean; reason?: string }) => void;
}) => {
  // ========== Reasoning Parts Consolidation ==========
  // Consolidate all reasoning parts into one block
  const reasoningParts = message.parts.filter((part) => part.type === "reasoning");
  const reasoningText = reasoningParts.map((part) => part.text).join("\n\n");
  const hasReasoning = reasoningParts.length > 0;
  // Check if reasoning is still streaming (last part is reasoning on last message)
  const lastPart = message.parts.at(-1);
  const isReasoningStreaming = isLastMessage && isStreaming && lastPart?.type === "reasoning";

  // ========== Tool Part Display Control ==========
  // 需要用户逐一确认 - 避免多个确认工具同时出现导致用户混淆
  // 找出第一个等待审批的确认工具索引，后续等待审批的确认工具暂时隐藏，逐一展示
  let firstPendingApprovalSeen = false;
  const hiddenPartIndices = new Set<number>();
  message.parts.forEach((part, index) => {
    if (isToolUIPart(part)) {
      const name = getToolName(part as AnyToolPart);
      if (name.startsWith("awaitingApproval") && (part as AnyToolPart).state === "approval-requested") {
        if (firstPendingApprovalSeen) {
          hiddenPartIndices.add(index);
        } else {
          firstPendingApprovalSeen = true;
        }
      }
    }
  });

  return (
    <>
      {hasReasoning && (
        <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
          <ReasoningTrigger />
          <ReasoningContent>{reasoningText}</ReasoningContent>
        </Reasoning>
      )}
      {message.parts.map((part, partIndex) => {
        // 文本内容
        if (part.type === "text") {
          return <MessageResponse key={`${message.id}-text-${partIndex}`}>{part.text}</MessageResponse>;
        }

        // 工具调用
        if (isToolUIPart(part)) {
          // 当前确认工具排在等待队列中，暂不渲染，等前一个处理完再显示
          if (hiddenPartIndices.has(partIndex)) return null;

          const toolPart = part as AnyToolPart;
          const name = getToolName(toolPart);

          // 通用确认卡片
          if (name.startsWith("awaitingApproval")) {
            return (
              <ConfirmationCommon
                key={toolPart.toolCallId}
                part={toolPart}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            );
          }

          return <ToolRenderer key={toolPart.toolCallId} part={toolPart} isShow={!isReasoningStreaming} />;
        }

        return null;
      })}
    </>
  );
};
