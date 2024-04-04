import { useEffect, useState } from "react";

const DARKMODE_KEY = "bruinen/view/darkMode";
const SELECTED_DATABASE_KEY = "bruinen/view/selectedDatabase";

export const usePersistentState = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        setValue(JSON.parse(storedValue));
      }
    }
  }, [key]);

  const setValuePersistent = (newValue: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
    setValue(newValue);
  };

  return [value, setValuePersistent];
};

export const useDarkMode = (): [boolean, (darkMode: boolean) => void] => {
  const [darkMode, setDarkMode] = usePersistentState(DARKMODE_KEY, false);

  return [darkMode, setDarkMode];
};

export const useSelectedDatabase = () => {
  const [selectedDatabase, setSelectedDatabase] = usePersistentState(
    SELECTED_DATABASE_KEY,
    "",
  );

  return [selectedDatabase, setSelectedDatabase];
};
