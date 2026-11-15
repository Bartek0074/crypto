import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Navigation } from "@/components/layout/navigation";
import { palette } from "@/config/theme";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Workspace",
  description: "A private workspace for crypto market research and strategy development.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: palette.background, color: palette.text }}>
        <AntdRegistry>
          <Providers>
            <Navigation>{children}</Navigation>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
