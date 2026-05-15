// app/worlds/[id]/workspace/components/workspace-tool-renderer.tsx
// 只读工具调用的简洁状态展示组件（查询 Lorebook、故事结构、章节内容）

"use client";

import type { DynamicToolUIPart, ToolResultPart, ToolUIPart } from "ai";
import { getToolName } from "ai";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  FileTextIcon,
  Loader2Icon,
  MapPinIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "lucide-react";

interface ToolRendererProps {
  part: ToolUIPart | DynamicToolUIPart | ToolResultPart;
  isShow?: boolean;
}

// 每个工具的简洁描述
const TOOL_META: Record<string, { icon: React.ElementType; label: string }> = {
  createTodoItem: { icon: PlusCircleIcon, label: "创建TODO" },
  deleteTodoItem: { icon: XCircleIcon, label: "删除TODO" },
};

function getToolSummary(toolName: string, part: ToolUIPart | DynamicToolUIPart): string {
  if (part.state !== "output-available") return "";
  const output = part.output as Record<string, unknown>;

  switch (toolName) {
    case "createTodoItem": {
      return output.title ? `: ${output.title} 创建成功` : "";
    }
    case "deleteTodoItem": {
      return output.id ? `: ID ${output.id} 已经被删除` : "";
    }
    default:
      return "";
  }
}

export function ToolRenderer({ part, isShow = true }: ToolRendererProps) {
  if (!isShow) return null;
  // Support both ToolUIPart/DynamicToolUIPart and emitted tool-result parts
  const isToolResult = (part as any)?.type === "tool-result";
  const toolName = isToolResult ? (part as any).toolName : getToolName(part as ToolUIPart | DynamicToolUIPart);
  const meta = TOOL_META[toolName];
  const Icon = meta?.icon ?? MapPinIcon;
  const label = meta?.label ?? toolName;

  const state = isToolResult ? "output-available" : (part as any).state;
  const isLoading = state === "input-streaming" || state === "input-available";
  const isError = state === "output-error";
  const isDone = state === "output-available";

  const normalizedPart = isToolResult
    ? ({ state: "output-available", output: (part as ToolResultPart).output } as ToolUIPart)
    : (part as ToolUIPart);

  const summary = isDone ? getToolSummary(toolName, normalizedPart) : "";

  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs">
      <span className="mt-0.5 shrink-0 text-primary">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-medium text-foreground">{label}</span>
        {summary && <span className="ml-1.5 text-muted-foreground">{summary}</span>}
      </div>
      <span className="mt-0.5 shrink-0">
        {isLoading && <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />}
        {isDone && <CheckCircle2Icon className="size-3.5 text-green-500" />}
        {isError && <XCircleIcon className="size-3.5 text-destructive" />}
      </span>
    </div>
  );
}
