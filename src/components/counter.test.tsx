import { render, fireEvent } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { Counter } from "#/components/counter.tsx";

describe(Counter, () => {
  it("increments on click", () => {
    expect.hasAssertions();

    const rendered = render(() => <Counter />);
    const button = rendered.getByRole("button");

    expect(button).toHaveTextContent("Clicks: 0");

    fireEvent.click(button);
    // Solid batches DOM updates; flush() applies them synchronously.
    flush();

    expect(button).toHaveTextContent("Clicks: 1");
  });
});
