import type { Locale } from "./i18n";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

const dictionaries = { ar, en } as const;

export type Dictionary = (typeof dictionaries)["ar"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
