import "./globals.css";
import SidebarLayout from "../components/SidebarLayout";

export const metadata = {
  title: "OTT Manager",
  description: "Manage OTT subscriptions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-x-hidden">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}