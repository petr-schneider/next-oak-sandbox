import { TRPCProvider } from "@/utils/TRPCReactProvider";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
