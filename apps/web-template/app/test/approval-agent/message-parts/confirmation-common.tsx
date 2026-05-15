"use client";

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@repo/share-ui/components/ai-elements/confirmation";
import { Item, ItemDescription, ItemTitle } from "@repo/share-ui/components/shadcn/item";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  CheckIcon,
  FlameIcon,
  ListOrderedIcon,
  SparklesIcon,
  SunriseIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { LuRefreshCcwDot } from "react-icons/lu";
import { TbCheckupList } from "react-icons/tb";
import { PopoverTextarea } from "./popover-textarea";

interface ConfirmationCommonProps {
  part: ToolUIPart | DynamicToolUIPart;
  addToolApprovalResponse: (response: { id: string; approved: boolean; reason?: string }) => void;
}

export function ConfirmationCommon({ part, addToolApprovalResponse }: ConfirmationCommonProps) {
  const input = (part.input ?? {
    title: "",
    description: "",
    dueDate: "",
  }) as any;

  console.log("ConfirmationCommon render", { part });
  const approval = part.approval;
  // const approval = (() => {
  //   if (part.state === "approval-requested") {
  //     return { id: part.approval.id } as const;
  //   }
  //   if (part.state === "approval-responded") {
  //     const { id, approved, reason } = part.approval;
  //     if (approved) {
  //       return { id, approved: true as const, reason };
  //     }
  //     return { id, approved: false as const, reason };
  //   }
  //   if (part.state === "output-available") {
  //     return part.approval;
  //   }
  //   return undefined;
  // })();

  return (
    <Confirmation approval={approval} state={part.state} className="max-w-sm">
      <ConfirmationTitle className="font-medium flex items-center gap-1.5">
        <TbCheckupList className="size-3.5 shrink-0" />
        待确认的操作
      </ConfirmationTitle>
      <Item>
        <ItemTitle>{input.title}</ItemTitle>
        <ItemDescription>{input.description}</ItemDescription>
      </Item>

      {/* 待确认操作按钮 */}
      <ConfirmationRequest>
        <ConfirmationActions>
          <ConfirmationAction
            variant="outline"
            onClick={() => {
              if (!approval?.id) {
                return;
              }
              addToolApprovalResponse({ id: approval.id, approved: false, reason: "用户选择取消" });
            }}
            disabled={!approval?.id}
          >
            <XIcon className="size-3.5" />
            取消
          </ConfirmationAction>{" "}
          <PopoverTextarea
            trigger={
              <ConfirmationAction variant="outline" disabled={!approval?.id}>
                <LuRefreshCcwDot className="size-3.5" />
                优化
              </ConfirmationAction>
            }
            onSubmit={(value) => {
              if (!approval?.id) {
                return;
              }
              addToolApprovalResponse({
                id: approval.id,
                approved: false,
                reason: `用户取消并认为需要修改为: ${value}。请按用户的修改建议重新生成内容，并再次请求确认。`,
              });
            }}
          ></PopoverTextarea>
          <ConfirmationAction
            onClick={() => {
              if (!approval?.id) {
                return;
              }
              addToolApprovalResponse({ id: approval.id, approved: true });
            }}
            disabled={!approval?.id}
          >
            <CheckIcon className="size-3.5" />
            允许
          </ConfirmationAction>
        </ConfirmationActions>
      </ConfirmationRequest>

      {/* 已接受 */}
      <ConfirmationAccepted>
        <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
        <p className="text-xs text-muted-foreground">已允许</p>
      </ConfirmationAccepted>

      {/* 已拒绝 */}
      <ConfirmationRejected>
        <XIcon className="size-4 text-destructive" />
        <p className="text-xs text-muted-foreground">已取消</p>
      </ConfirmationRejected>
    </Confirmation>
  );
}
