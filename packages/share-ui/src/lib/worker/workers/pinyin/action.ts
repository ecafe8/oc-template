import ModernChineseDict from "@pinyin-pro/data/modern";
import { addDict, pinyin } from "pinyin-pro";
// import CompleteDict from '@pinyin-pro/data/complete';
import type { Text2PinYin } from "./type";

addDict(ModernChineseDict);
// addDict(CompleteDict);

export const text2pinyin = (input: string): Text2PinYin[] => {
  try {
    const pinyinArray = pinyin(input, { type: "array", segmentit: 2 });
    return pinyinArray.map((py: string, index: number) => ({
      pinyin: py,
      text: input[index] ?? "",
    }));
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};
