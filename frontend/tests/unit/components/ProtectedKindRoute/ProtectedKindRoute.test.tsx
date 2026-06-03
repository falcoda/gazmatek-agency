import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import ProtectedKindRoute from "@/components/ProtectedKindRoute/ProtectedKindRoute";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { useClientAuthStore } from "@/stores/ClientAuthStore";

type Kind = "artist" | "admin" | "client";

function renderGuard(kind: Kind) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedKindRoute kind={kind}>
              <div>protected content</div>
            </ProtectedKindRoute>
          }
        />
        <Route path="/artist/login" element={<div>artist login</div>} />
        <Route path="/admin/login" element={<div>admin login</div>} />
        <Route path="/account/login" element={<div>client login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedKindRoute", () => {
  afterEach(() => {
    useArtistAuthStore.getState().clear();
    useAdminAuthStore.getState().clear();
    useClientAuthStore.getState().clear();
  });

  it("renders children when the matching identity is present", () => {
    useArtistAuthStore.setState({
      artist: { id: "ar1", email: "a@b.c", stageName: "DJ" },
    });
    const { getByText } = renderGuard("artist");
    expect(getByText("protected content")).toBeInTheDocument();
  });

  it("redirects to the kind's login when no identity is present", () => {
    useAdminAuthStore.setState({ admin: null });
    const { getByText, queryByText } = renderGuard("admin");
    expect(getByText("admin login")).toBeInTheDocument();
    expect(queryByText("protected content")).not.toBeInTheDocument();
  });

  it("does not let one actor's identity satisfy another kind", () => {
    // An admin identity must not unlock an artist-only route.
    useAdminAuthStore.setState({
      admin: { id: "a1", email: "admin@x.y", fullName: "Admin" },
    });
    const { getByText, queryByText } = renderGuard("artist");
    expect(getByText("artist login")).toBeInTheDocument();
    expect(queryByText("protected content")).not.toBeInTheDocument();
  });

  it("gates client routes on the client identity", () => {
    useClientAuthStore.setState({
      client: { id: "c1", email: null, displayName: null },
      isAuthenticated: true,
    });
    const { getByText } = renderGuard("client");
    expect(getByText("protected content")).toBeInTheDocument();
  });
});
