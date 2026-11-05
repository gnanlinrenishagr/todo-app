import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback(
    (message, type = "success") => {
      clearTimeout(timer.current);
      setToast({ message, type });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showToast };
}