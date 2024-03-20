export const toSnakeCase = (input: string | null | undefined): string => {
  if (!input) {
    return "";
  }
  const cleanedInput = input.replace(/[^\w\s]/gi, "").toLowerCase();
  return cleanedInput.replace(/\s+/g, "_");
};
