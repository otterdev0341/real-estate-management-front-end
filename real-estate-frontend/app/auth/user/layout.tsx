
import { ReactNode } from "react";
import { VerticalNavbar } from "@/components/navbar/VecticalNavBar";



const layout = ({ children }: {children: ReactNode}) => {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <VerticalNavbar />
        {children}
      </body>
    </html>
  )
}
export default layout