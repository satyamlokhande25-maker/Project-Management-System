import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning yahan add kiya hai */}
      <body className="bg-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}