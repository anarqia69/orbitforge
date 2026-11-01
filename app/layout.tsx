import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "./solana-provider";
export const metadata: Metadata = { title: "OrbitForge — Solana Token Studio", description: "Create Solana SPL tokens directly from your wallet. You stay in control of every transaction." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><SolanaProvider>{children}</SolanaProvider></body></html>; }
