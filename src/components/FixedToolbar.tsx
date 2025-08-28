import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function FixedToolbar({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("toolbar-root") as HTMLElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "toolbar-root";
      document.body.appendChild(el);
    }
    setRoot(el);
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const resize = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--toolbar-h", `${h}px`);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    document.body.classList.add("toolbar-open");
    return () => {
      ro.disconnect();
      document.body.classList.remove("toolbar-open");
      document.documentElement.style.removeProperty("--toolbar-h");
    };
  }, [root]);

  if (!root) return null;

  return createPortal(
    <div ref={ref} className="ss-toolbar-fixed">
      {children}
    </div>,
    root
  );
}
