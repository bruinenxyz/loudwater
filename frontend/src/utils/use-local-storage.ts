import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, defaultVal: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const tempValue = window.localStorage.getItem(key);
    return tempValue !== null ? JSON.parse(tempValue) : defaultVal;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}

export default useLocalStorage;
