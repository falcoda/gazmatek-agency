import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import CookieConsent from "../components/CookieConsent/CookieConsent";
import CustomCursor from "../components/CustomCursor/CustomCursor";
import Footer from "../components/Footer/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher/LanguageSwitcher";
import SeoHead from "../components/SeoHead/SeoHead";
import { Navbar } from "../covaltech-react-ui";
import useNavItems from "../hooks/useNavItems";

interface AppShellProps {
  children: ReactNode;
  showLangSwitcher?: boolean;
}

function AppShell({ children, showLangSwitcher = false }: AppShellProps) {
  const navItems = useNavItems();

  return (
    <div className="App">
      <SeoHead />
      <CustomCursor />
      <Navbar
        navItems={navItems}
        mobileBeforeChildren={
          showLangSwitcher ? <LanguageSwitcher mobile /> : undefined
        }
      >
        {showLangSwitcher && <LanguageSwitcher />}
      </Navbar>
      <main>{children}</main>
      <Footer />
      <CookieConsent />
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default AppShell;
