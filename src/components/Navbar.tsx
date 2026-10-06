"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FolderTree, GitBranch, Layers, Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Início", href: "/", icon: BookOpen },
    { label: "Categorias", href: "/categories", icon: FolderTree },
    { label: "Projetos", href: "/projects", icon: Layers },
    { label: "Fontes", href: "/sources", icon: GitBranch },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 group-hover:border-sky-400 transition-colors">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-semibold text-foreground tracking-tight text-base sm:text-lg block group-hover:text-sky-400 transition-colors">
              GitHub Knowledge Wiki
            </span>
            <span className="text-[11px] text-muted-foreground font-mono hidden sm:block">
              Ingestão estática &bull; Git Source of Truth
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
