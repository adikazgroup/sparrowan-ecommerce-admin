import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Inter } from "next/font/google";
import ReduxLayout from "@/components/layout/ReduxLayout";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/context/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={inter.className}
      data-theme="light"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers>
          <ReduxLayout>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <Toaster />
          </ReduxLayout>
        </Providers>
      </body>
    </html>
  );
}
