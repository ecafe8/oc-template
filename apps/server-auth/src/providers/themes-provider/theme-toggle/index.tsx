"use client";
import { Button } from "@repo/share-ui/components/reui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdModeNight, MdOutlineWbSunny } from "react-icons/md";

const ThemeToggle = (): React.ReactElement | null => {
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  // 防止服务器端渲染与客户端渲染不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="btn btn-ghost btn-circle text-lg" aria-hidden="true" />;
  }

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="btn btn-ghost btn-circle text-lg focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`切换到${theme === "dark" ? "亮色" : "暗色"}模式`}
      onClick={toggleTheme}
    >
      <div className="flex items-center justify-center">
        {theme === "dark" ? <MdOutlineWbSunny className="h-5 w-5" /> : <MdModeNight className="h-5 w-5" />}
      </div>
    </Button>
  );
};

export default ThemeToggle;
