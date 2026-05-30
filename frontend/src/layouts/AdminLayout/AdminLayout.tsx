import "./AdminLayout.scss";

import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { Navbar } from "@/covaltech-react-ui";
import useAdminNavItems from "@/hooks/useAdminNavItems";

import AdminLogoutButton from "./AdminLogoutButton/AdminLogoutButton";

const AdminLayout = () => {
  const navItems = useAdminNavItems();

  return (
    <div className="adminLayout">
      <SeoHead />
      <Navbar navItems={navItems} mobileChildren={<AdminLogoutButton />}>
        <AdminLogoutButton />
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

export default AdminLayout;
