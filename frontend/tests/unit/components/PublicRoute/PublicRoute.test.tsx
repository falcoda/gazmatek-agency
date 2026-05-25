import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import PublicRoute from "@/components/PublicRoute/PublicRoute";
import { useAuthStore } from "@/stores/AuthStore";

function renderGuard(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>login page</div>} />
        </Route>
        <Route path="/" element={<div>home page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PublicRoute", () => {
  afterEach(() => {
    useAuthStore.getState().clearUser();
  });

  it("renders the child route when the user is not authenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { getByText } = renderGuard(["/login"]);

    expect(getByText("login page")).toBeInTheDocument();
  });

  it("redirects authenticated users away to the main page", () => {
    useAuthStore.setState({ isAuthenticated: true });

    const { getByText, queryByText } = renderGuard(["/login"]);

    expect(getByText("home page")).toBeInTheDocument();
    expect(queryByText("login page")).not.toBeInTheDocument();
  });
});
