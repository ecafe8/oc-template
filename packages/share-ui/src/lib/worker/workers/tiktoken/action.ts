import type { TiktokenEncoding, TiktokenModel } from "tiktoken";
import { get_encoding } from "tiktoken";
import models from "tiktoken/model_to_encoding.json";

type Models = typeof models;

const encoderMap = new Map<string, ReturnType<typeof get_encoding>>();

export const tiktoken = async (input: string, modelName: TiktokenModel = "gpt-4o") => {
  if (!encoderMap.has(modelName)) {
    encoderMap.set(modelName, get_encoding((models as Models)[modelName] as TiktokenEncoding));
  }
  const encoder = encoderMap.get(modelName);
  if (!encoder) {
    throw new Error(`encoder for model ${modelName} not found`);
  }
  const tokens = encoder.encode(input);
  console.log(tokens);
  return tokens;
};
