import { Suspense } from "react";

import RouteFallback from "@/components/RouteFallback/RouteFallback";

import { I18N_ROUTING } from "../../config/site";
import I18nRouter from "./I18nRouter";
import MonoRouter from "./MonoRouter";

function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      {I18N_ROUTING ? <I18nRouter /> : <MonoRouter />}
    </Suspense>
  );
}

export default AppRouter;
