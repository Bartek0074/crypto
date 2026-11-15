"use client";

import { ConfigProvider, theme } from "antd";
import { palette } from "@/config/theme";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: palette.primary,
          colorBgBase: palette.background,
          colorBgLayout: palette.background,
          colorBgContainer: palette.surface,
          colorBorder: palette.border,
          colorText: palette.text,
          colorTextSecondary: palette.textSecondary,
          borderRadius: 2,
          fontFamily: "Arial, Helvetica, sans-serif",
        },
        components: {
          Layout: {
            headerBg: palette.background,
            siderBg: palette.sidebar,
          },
          Menu: {
            darkItemBg: palette.sidebar,
            darkItemSelectedBg: palette.selectedBackground,
            darkItemSelectedColor: palette.selectedText,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
