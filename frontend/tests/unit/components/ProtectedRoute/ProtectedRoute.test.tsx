import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useAuthStore } from "@/stores/AuthStore";

function renderGuard(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<div>private content</div>} />
          <Route path="/:lang/private" element={<div>localized private</div>} />
        </Route>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/:lang/login" element={<div>localized login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    useAuthStore.getState().clearUser();
  });

  it("renders the child route when the user is authenticated", () => {
    useAuthStore.setState({ isAuthenticated: true });

    const { getByText } = renderGuard(["/private"]);

    expect(getByText("private content")).toBeInTheDocument();
  });

  it("redirects to the login page when the user is not authenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { getByText, queryByText } = renderGuard(["/private"]);

    expect(getByText("login page")).toBeInTheDocument();
    expect(queryByText("private content")).not.toBeInTheDocument();
  });

  it("redirects to the localized login path when a supported lang param is present", () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { getByText } = renderGuard(["/fr/private"]);

    expect(getByText("localized login")).toBeInTheDocument();
  });
});
