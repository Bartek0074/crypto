"use client";

import { Button, Drawer, Layout, Menu, Space, Tag, theme, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const pages = [
  { href: "/", label: "Home" },
  { href: "/strategy/strategy-one", label: "Strategy 1" },
  { href: "/strategy/strategy-two", label: "Strategy 2" },
];

export function Navigation({ children }: Readonly<{ children: React.ReactNode }>) {
  const { token } = theme.useToken();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = pages.find((page) => page.href === pathname);
  const items = pages.map(({ href, label }) => ({
    key: href,
    label: (
      <Link href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>
        {label}
      </Link>
    ),
  }));
  const menu = <Menu theme="dark" mode="inline" selectedKeys={currentPage ? [currentPage.href] : []} items={items} />;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <aside className="hidden md:block">
        <Layout.Sider width={240} style={{ minHeight: "100vh", borderRight: `1px solid ${token.colorBorder}` }}>
          <div className="px-6 pt-8 pb-10">
            <Typography.Title level={4} style={{ margin: 0 }}>
              CRYPTO<span style={{ color: token.colorPrimary }}>.</span>
            </Typography.Title>
          </div>
          <nav aria-label="Main navigation">{menu}</nav>
        </Layout.Sider>
      </aside>
      <Drawer title="Navigation" placement="left" open={menuOpen} onClose={() => setMenuOpen(false)} size={260}>
        <nav aria-label="Mobile navigation">{menu}</nav>
      </Drawer>

      <Layout>
        <Layout.Header
          style={{
            height: 68,
            padding: "0 24px",
            borderBottom: `1px solid ${token.colorBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Space>
            <span className="md:hidden">
              <Button onClick={() => setMenuOpen(true)} aria-label="Open navigation">Menu</Button>
            </span>
            <Typography.Text type="secondary">Workspace</Typography.Text>
            {currentPage && (
              <>
                <Typography.Text type="secondary">/</Typography.Text>
                <Typography.Text>{currentPage.label}</Typography.Text>
              </>
            )}
          </Space>
        </Layout.Header>
        <Layout.Content className="px-5 py-8 md:px-10 md:py-12">
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
