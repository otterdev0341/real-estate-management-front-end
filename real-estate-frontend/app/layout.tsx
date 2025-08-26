
import { ReactNode } from "react";
import "./globals.css";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Real Estate Management",
  description: "A real estate management application",
  keywords: ["real estate", "management", "properties", "listings"],
};

const layout = ({ children }: {children: ReactNode}) => {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
export default layout