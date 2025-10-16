import { useEffect, useState } from "react";

/**
 * Returns a value only on the client side (after hydration).
 * Useful to avoid SSR hydration mismatches in Expo Router.
 */
export function useClientOnlyValue<T>(serverValue: T, clientValue: T) {
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setValue(clientValue);
  }, [clientValue]);

  return value;
}
