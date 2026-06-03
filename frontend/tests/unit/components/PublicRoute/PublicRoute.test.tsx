import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import PublicRoute from "@/components/PublicRoute/PublicRoute";
import { useClientAuthStore } from "@/stores/ClientAuthStore";

function renderGuard(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/account/login" element={<div>login page</div>} />
        </Route>
        <Route path="/account" element={<div>dashboard page</div>} />
        <Route path="/booking/new" element={<div>next page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PublicRoute", () => {
  afterEach(() => {
    useClientAuthStore.getState().clear();
  });

  const CLIENT = { id: "c1", email: "c@example.com", displayName: "C" };

  it("renders the child route when the client is not authenticated", () => {
    useClientAuthStore.setState({ client: null, isAuthenticated: false });

    const { getByText } = renderGuard(["/account/login"]);

    expect(getByText("login page")).toBeInTheDocument();
  });

  it("redirects an authenticated client to the dashboard", () => {
    useClientAuthStore.setState({ client: CLIENT, isAuthenticated: true });

    const { getByText, queryByText } = renderGuard(["/account/login"]);

    expect(getByText("dashboard page")).toBeInTheDocument();
    expect(queryByText("login page")).not.toBeInTheDocument();
  });

  it("honours the `next` param when redirecting an authenticated client", () => {
    useClientAuthStore.setState({ client: CLIENT, isAuthenticated: true });

    const { getByText } = renderGuard(["/account/login?next=/booking/new"]);

    expect(getByText("next page")).toBeInTheDocument();
  });
});
