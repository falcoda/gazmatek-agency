import "./RouteFallback.scss";

import { Spinner } from "@/covaltech-react-ui";

/**
 * Suspense fallback shown while a lazily-loaded route chunk is being fetched.
 */
const RouteFallback = () => {
  return (
    <div className="routeFallback" role="status" aria-live="polite">
      <Spinner size={54} />
    </div>
  );
};

export default RouteFallback;
