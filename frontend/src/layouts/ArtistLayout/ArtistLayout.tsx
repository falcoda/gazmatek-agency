import "./ArtistLayout.scss";

import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { Navbar } from "@/covaltech-react-ui";
import useArtistNavItems from "@/hooks/useArtistNavItems";

import ArtistLogoutButton from "./ArtistLogoutButton/ArtistLogoutButton";

const ArtistLayout = () => {
  const navItems = useArtistNavItems();

  return (
    <div className="artistLayout">
      <SeoHead />
      <Navbar navItems={navItems} mobileChildren={<ArtistLogoutButton />}>
        <ArtistLogoutButton />
      </Navbar>
      <main className="main">
        <div className="content">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontFamily:
              '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 14,
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
};

export default ArtistLayout;
