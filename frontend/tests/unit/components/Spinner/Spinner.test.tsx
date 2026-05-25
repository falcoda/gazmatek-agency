import { render } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import Spinner from "@/components/Spinner/Spinner";

describe("Spinner", () => {
  it("renders the spinner container", () => {
    const { container } = render(<Spinner />);

    expect(container.querySelector(".spinnerContainer")).not.toBeNull();
    expect(container.querySelector(".spinner")).not.toBeNull();
  });

  it("renders the eight animated balls", () => {
    const { container } = render(<Spinner />);

    const spinner = container.querySelector(".spinner");
    expect(spinner).not.toBeNull();
    expect(spinner?.querySelectorAll("span")).toHaveLength(8);
  });
});
