"use client";
import { Cascader, type Option } from "@repo/share-ui/components/ui/cascader";

const options: Option[] = [
  {
    value: "zhejiang",
    label: "Zhejiang",
    children: [
      {
        value: "hangzhou",
        label: "Hangzhou",
        children: [
          {
            value: "xihu",
            label: "West Lake",
          },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "Jiangsu",
    children: [
      {
        value: "nanjing",
        label: "Nanjing",
        children: [
          {
            value: "zhonghuamen",
            label: "Zhong Hua Men",
          },
        ],
      },
    ],
  },
];

export default function CascaderTest() {
  return (
    <Cascader
      options={options}
      value={[]}
      onChange={(v) => {
        console.log("Cascader value:", v);
      }}
    />
  );
}
