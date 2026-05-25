import { Route, Routes } from "react-router-dom";

import { PAGES } from "../../config/pages";
import AppShell from "../AppShell";
import { Home, NotFound } from "./lazyPages";

function MonoRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path={PAGES.main} element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

export default MonoRouter;
