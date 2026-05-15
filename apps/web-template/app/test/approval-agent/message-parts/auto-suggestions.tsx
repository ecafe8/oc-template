import { Shimmer } from "@repo/share-ui/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@repo/share-ui/components/ai-elements/suggestion";
import { Button } from "@repo/share-ui/components/reui/button";
import { convertToModelMessages, isDeepEqualData, type UIMessage } from "ai";
import { isEqual } from "radash";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { LuDices } from "react-icons/lu";

const DEFAULT_SUGGESTIONS = ["创建一个明天要上班的待办事项"];

export function AutoSuggestions({
  onSelectSuggestion,
  messages,
  apiUrl = "/api/ai/suggestion",
}: {
  messages: Array<UIMessage>;
  apiUrl?: string;
  onSelectSuggestion: (suggestion: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const msgCountRef = useRef(0);
  const isDefault = isEqual(suggestions, DEFAULT_SUGGESTIONS);

  // 获取智能建议
  const fetchSuggestions = useCallback(async () => {
    if (!apiUrl) {
      return;
    }
    setLoadingSuggestions(true);

    try {
      const uiMessages = messages.map((m) => ({
        role: m.role,
        content: m.parts.map((p) => ("text" in p ? p.text : "")).join(""),
      }));

      console.log("[Suggestion] uiMessages:", uiMessages);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: uiMessages,
          preSuggestions: isDefault ? [] : suggestions, // 只有在当前显示的不是默认建议时才传递 preSuggestions
        }),
      });

      const result = await response.json();
      console.log("[Suggestion] API response:", result);

      if (result.code === "SUCCESS" && result.data?.suggestions) {
        console.log("[Suggestion] setting suggestions:", result.data.suggestions);
        setSuggestions(result.data.suggestions);
        setShowSuggestions(true);
      } else {
        // API 返回错误时保持显示当前建议
        console.log("[Suggestion] API returned error, keeping current suggestions");
        setShowSuggestions(true);
      }
    } catch (err) {
      // 静默失败，保持显示当前建议
      console.error("[Suggestion] fetch error:", err);
      setShowSuggestions(true);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [messages, apiUrl, isDefault, suggestions]);

  useEffect(() => {
    const userMsgCount = messages.length;
    if (userMsgCount > msgCountRef.current) {
      msgCountRef.current = userMsgCount;
      fetchSuggestions();
    }
    if (messages.length === 0) {
      setSuggestions(DEFAULT_SUGGESTIONS);
      setShowSuggestions(true);
    }
  }, [fetchSuggestions, messages]);

  if (!showSuggestions) return null;
  return (
    (showSuggestions || loadingSuggestions) && (
      <div className="shrink-0 w-full">
        {loadingSuggestions ? (
          <div className="mb-3 flex items-center text-sm text-muted-foreground">
            <ImSpinner2 className="animate-spin mr-2" />{" "}
            <Shimmer className="block text-sm text-muted-foreground">正在为你生成建议...</Shimmer>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* <div className="text-xs text-muted-foreground whitespace-nowrap pb-3">快捷建议:</div> */}
            <Suggestions className="flex-1 pb-3">
              {suggestions.map((s) => (
                <Suggestion
                  key={s}
                  suggestion={s}
                  onClick={() => {
                    onSelectSuggestion(s);
                    setShowSuggestions(false);
                  }}
                />
              ))}
            </Suggestions>
            {!isDefault && (
              <Button
                key="refresh"
                className="mb-3"
                size="icon-sm"
                variant="ghost"
                onClick={fetchSuggestions}
                aria-label="刷新建议"
              >
                <LuDices className="size-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    )
  );
}
