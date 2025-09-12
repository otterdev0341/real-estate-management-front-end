
import { ContactProvider } from "../store/ContactStore";
import { ContactTypeProvider } from "../store/ContactTypeStore";
import { ExpenseProvider } from "../store/ExpenseStore";
import { ExpenseTypeProvider } from "../store/ExpenseTypeStore";
import { InvestmentProvider } from "../store/InvestmentStore";
import { MemoProvider } from "../store/MemoStore";
import { MemoTypeProvider } from "../store/MemoTypeStore";
import { ModalProvider } from "../store/ModalStore";
import { PaymentProvider } from "../store/PaymentStore";
import { PropertyStatusProvider } from "../store/PropertyStatusStore";
import { PropertyProvider } from "../store/PropertyStore";
import { PropertyTypeProvider } from "../store/PropertyTypeStore";
import { SaleProvider } from "../store/SaleStore";
import { UserProvider } from "../store/UserStore";


export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ModalProvider>
      <MemoTypeProvider>
        <ExpenseTypeProvider>
          <ExpenseProvider>
            <ContactTypeProvider>
              <ContactProvider>
                <PropertyStatusProvider>
                  <PropertyTypeProvider>
                    <MemoProvider>
                      <PropertyProvider>
                        <SaleProvider>
                          <PaymentProvider>
                            <InvestmentProvider>
                            {children}
                            </InvestmentProvider>
                          </PaymentProvider>
                        </SaleProvider>
                      </PropertyProvider>
                  </MemoProvider>
                </PropertyTypeProvider>
              </PropertyStatusProvider>
              </ContactProvider>
          </ContactTypeProvider>
          </ExpenseProvider>
        </ExpenseTypeProvider>
      </MemoTypeProvider>
    </ModalProvider>
    </UserProvider>
  )
}