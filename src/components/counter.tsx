import { createSignal } from "solid-js";

export function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((previous) => previous + 1)} type="button">
      Clicks: {count()}
    </button>
  );
}
