import { type AlibabaLanguageModelOptions, createAlibaba } from "@ai-sdk/alibaba";
import { createAzure } from "@ai-sdk/azure";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  type GenerateTextResult,
  generateText,
  type LanguageModel,
  type ModelMessage,
  Output,
  type Provider,
  streamText,
  type ToolSet,
  wrapLanguageModel,
} from "ai";
import { createOllama } from "ai-sdk-ollama";

export const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  baseURL: process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1",
});

export const ollama = createOllama({
  // optional settings, e.g.
  baseURL: process.env.OLLAMA_HOST || "http://localhost:11434",
});

// 自定义 Google 供应商
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  baseURL: `${process.env.GOOGLE_GENERATIVE_BASE_URL}/v1beta`,
});

// 自定义 Azure OpenAI 供应商
export const azureProvider = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

// 自定义 DashScope 供应商
export const dashscopeProvider = createAlibaba({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// 默认中间件设置
const defaultSimpleMiddleware = defaultSettingsMiddleware({
  settings: {
    temperature: 0.5,
    providerOptions: {},
  },
});

const withMiddleware = (model: LanguageModel, providerOptions?: Record<string, unknown>) =>
  wrapLanguageModel({
    // @ts-expect-error 因为 SDK 没有导出 LanguageModelV3 类型，所以这里直接使用 @ts-expect-error 忽略类型检查
    model,
    // TODO: 这里可以根据需要添加更多的中间件，比如日志记录、错误处理等
    middleware: [defaultSimpleMiddleware],
    ...providerOptions,
  });

const alibabaProviderOptions = {
  alibaba: {
    enableThinking: true,
    thinkingBudget: 2048,
  } satisfies AlibabaLanguageModelOptions,
};

// 组合多个供应商
export const combinedProviders: Provider = customProvider({
  languageModels: {
    // ================= LM Studio 系列 =================
    "lmstudio:qwen3.5": withMiddleware(lmstudio.languageModel("qwen3.5")),
    // ================= ollama 系列 =================
    "ollama:qwen3.5": withMiddleware(ollama.languageModel("qwen3.5")),
    // ================= Azure OpenAI 系列 =================
    "azure:gpt-4o": withMiddleware(azureProvider("gpt-4o")),
    "azure:gpt-5-mini": withMiddleware(azureProvider("gpt-5-mini")),
    // ================= DashScope 系列 =================
    "dashscope:kimi-k2.5": withMiddleware(dashscopeProvider("kimi-k2.5")),
    "dashscope:qwen-plus": withMiddleware(dashscopeProvider("qwen-plus")),
    "dashscope:qwen3.5-plus": withMiddleware(dashscopeProvider("qwen3.5-plus")),
    "dashscope:qwq-plus-stream": withMiddleware(dashscopeProvider("qwq-plus")),
    "dashscope:qwen3.5-35b-a3b": withMiddleware(dashscopeProvider("qwen3.5-35b-a3b")),
    "dashscope:qwen-flash": withMiddleware(dashscopeProvider("qwen-flash")),
    "dashscope:qwen3.5-flash-2026-02-23": withMiddleware(
      dashscopeProvider("qwen3.5-flash-2026-02-23"),
      alibabaProviderOptions,
    ),
    // 思考增强模型
    "dashscope:qwen3.5-plus-2026-02-15": withMiddleware(
      dashscopeProvider("qwen3.5-plus-2026-02-15"),
      alibabaProviderOptions,
    ),
    "dashscope:qwen-max-thinking": withMiddleware(dashscopeProvider("qwen-max"), alibabaProviderOptions),
    "dashscope:qwen3.5-397b-a17b": withMiddleware(dashscopeProvider("qwen3.5-397b-a17b"), alibabaProviderOptions),
    // ================= Google Gemini 系列 =================
    "google:gemini-3-flash-preview": withMiddleware(google("gemini-3-flash-preview")),
  },
});

// 导出默认模型，方便在其他地方直接使用
export const defaultChatModel = combinedProviders.languageModel("dashscope:qwen3.5-flash-2026-02-23");

export const defaultSuggestionModel = combinedProviders.languageModel("dashscope:qwen3.5-flash-2026-02-23");

// export const defaultAgentModel = combinedProviders.languageModel("google:gemini-3-flash-preview");
export const defaultAgentModel = combinedProviders.languageModel("dashscope:qwen3.5-397b-a17b");
