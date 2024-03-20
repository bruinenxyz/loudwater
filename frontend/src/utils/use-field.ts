import { useState } from "react";
import { ZodError, z } from "zod";

type FieldState<T> = {
  value?: T;
  onValueChange: (value: T) => void;
  error: string | undefined;
};

export function useField<T>(
  initialValue?: T,
  params?: {
    schema?: z.Schema<T>;
    valueTransformer?: (value: T) => T;
    valueTester?: (vlaue: T) => void;
  },
): FieldState<T> {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const onValueChange = (newValue: T) => {
    if (params?.valueTransformer) {
      newValue = params.valueTransformer(newValue);
    }
    if (params?.valueTester) {
      params.valueTester(newValue);
    }
    setValue(newValue);

    if (params?.schema) {
      try {
        params.schema.parse(newValue);
        setError(undefined);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return { value, onValueChange, error };
}
