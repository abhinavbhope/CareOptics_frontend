import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = (e) => setIsMobile(e.matches);

    // Set initial value
    setIsMobile(mql.matches);

    // Add listener
    if (mql.addEventListener) {
      mql.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mql.addListener(handleChange);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleChange);
      } else {
        mql.removeListener(handleChange);
      }
    };
  }, []);

  return isMobile;
}
