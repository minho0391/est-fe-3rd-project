// [모달 포커스 관리] 모달이 열리면 안쪽으로 포커스를 옮기고 Tab 순환을 모달 안에 가둡니다.
// 닫힐 때는 모달을 열었던 요소로 포커스를 되돌립니다.
import { useEffect, useRef } from "react";

// 포커스를 받을 수 있는 요소들. disabled·tabindex="-1" 은 제외합니다.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function useFocusTrap(open) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    // 모달을 열었던 요소를 기억해 뒀다가 닫을 때 되돌려 줍니다.
    previousFocusRef.current = document.activeElement;

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        el => el.offsetParent !== null,
      );

    // 첫 포커스는 모달 안쪽 첫 요소로 옮깁니다.
    const focusable = getFocusable();
    (focusable[0] ?? container).focus();

    const handleKeyDown = event => {
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      // 마지막에서 Tab 은 처음으로, 처음에서 Shift+Tab 은 마지막으로 돌립니다.
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  return containerRef;
}
