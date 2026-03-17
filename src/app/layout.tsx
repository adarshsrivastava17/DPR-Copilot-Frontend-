import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "DPR Copilot — AI-Powered Project Report Generator",
  description:
    "Generate professional Detailed Project Reports in under 5 minutes. AI-powered DPR generation for bank loans, MSME schemes, and investor proposals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#003366",
              color: "#fff",
              borderRadius: "10px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
