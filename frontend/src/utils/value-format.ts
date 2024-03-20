import _ from "lodash";
import numeral from "numeral";

export const formatNumber = (num: string) => {
  const currentNumeral = numeral(num);
  return currentNumeral.format("0,0");
};

export function formatDateString(
  date: Date,
  formatTemplate: Intl.DateTimeFormatOptions,
) {
  return _.chain(date.toLocaleString("en-US", formatTemplate))
    .replace(/,/g, "") // Remove commas
    .replace(/AM|PM/g, (match) => match.toLowerCase()) // Make AM/PM lowercase
    .value();
}

export function getFormattedDateStrings(value: any) {
  const date = new Date(value as string);
  const baseFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    weekday: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  const localString = formatDateString(date, baseFormat);
  const utcString = formatDateString(date, {
    ...baseFormat,
    timeZone: "UTC",
  });
  return { localString, utcString };
}
