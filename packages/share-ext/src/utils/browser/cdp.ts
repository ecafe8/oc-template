import { getCurrentTab } from "@repo/share-ext/utils/browser/tabs";

export const CDPAttachDebugger = async (tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.attach({ tabId: currentTab.id }, "1.3");
};

export const CDPDetachDebugger = async (tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.detach({ tabId: currentTab.id });
};

export const CDPExecuteClick = async (x: number, y: number, tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });

  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
};

export const CDPExecuteMouseDown = async (x: number, y: number, tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
};

export const CDPExecuteMouseMove = async (x: number, y: number, tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x,
    y,
    button: "left",
    clickCount: 0,
  });
};

export const CDPExecuteMouseUp = async (x: number, y: number, tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
};

export const CDPExecuteType = async (x: number, y: number, text: string, tab?: browser.tabs.Tab) => {
  const currentTab = tab || (await getCurrentTab());
  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });

  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });

  for (const char of text) {
    await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchKeyEvent", {
      type: "keyDown",
      text: char,
      unmodifiedText: char,
      key: char,
      code: char,
      windowsVirtualKeyCode: char.charCodeAt(0),
      nativeVirtualKeyCode: char.charCodeAt(0),
      autoRepeat: false,
      isKeypad: false,
      isSystemKey: false,
    });

    await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchKeyEvent", {
      type: "keyUp",
      text: char,
      unmodifiedText: char,
      key: char,
      code: char,
      windowsVirtualKeyCode: char.charCodeAt(0),
      nativeVirtualKeyCode: char.charCodeAt(0),
      autoRepeat: false,
      isKeypad: false,
      isSystemKey: false,
    });
  }
};

export const CDPExecuteScroll = async (
  direction: "up" | "down" | "left" | "right",
  percentage: number,
  tab?: browser.tabs.Tab,
) => {
  const currentTab = tab || (await getCurrentTab());
  const scrollAmount = percentage; // 可以根据需要调整滚动量的计算方式

  let deltaX = 0;
  let deltaY = 0;

  switch (direction) {
    case "up":
      deltaY = -scrollAmount;
      break;
    case "down":
      deltaY = scrollAmount;
      break;
    case "left":
      deltaX = -scrollAmount;
      break;
    case "right":
      deltaX = scrollAmount;
      break;
  }

  await browser.debugger.sendCommand({ tabId: currentTab.id }, "Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 0,
    y: 0,
    deltaX,
    deltaY,
    modifiers: 0,
    pointerType: "mouse",
  });
};
