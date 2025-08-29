
import { ContactProvider } from "../store/ContactStore";
import { ContactTypeProvider } from "../store/ContactTypeStore";
import { ExpenseProvider } from "../store/ExpenseStore";
import { ExpenseTypeProvider } from "../store/ExpenseTypeStore";
import { MemoProvider } from "../store/MemoStore";
import { MemoTypeProvider } from "../store/MemoTypeStore";
import { PropertyStatusProvider } from "../store/PropertyStatusStore";
import { PropertyTypeProvider } from "../store/PropertyTypeStore";


export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemoTypeProvider>
      <ExpenseTypeProvider>
        <ExpenseProvider>
          <ContactTypeProvider>
            <ContactProvider>
              <PropertyStatusProvider>
                <PropertyTypeProvider>
                  <MemoProvider>
                    
                  {children}
                  
                </MemoProvider>
              </PropertyTypeProvider>
            </PropertyStatusProvider>
            </ContactProvider>
        </ContactTypeProvider>
        </ExpenseProvider>
      </ExpenseTypeProvider>
    </MemoTypeProvider>
  )
}