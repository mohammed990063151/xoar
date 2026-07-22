"use client";

import { useEffect } from "react";
import { readFormProfile } from "@/lib/form-profile-cookie";

type StringSetter = React.Dispatch<React.SetStateAction<string>>;

/**
 * Prefill empty form fields from the saved contact cookie.
 */
export function useFormProfileAutofill(
  setters: {
    setName?: StringSetter;
    setEmail?: StringSetter;
    setPhone?: StringSetter;
    setCity?: StringSetter;
  },
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const saved = readFormProfile();

    if (saved.name && setters.setName) {
      setters.setName((value) => value || saved.name!);
    }
    if (saved.email && setters.setEmail) {
      setters.setEmail((value) => value || saved.email!);
    }
    if (saved.phone && setters.setPhone) {
      setters.setPhone((value) => value || saved.phone!);
    }
    if (saved.city && setters.setCity) {
      setters.setCity((value) => value || saved.city!);
    }
  }, [enabled, setters.setName, setters.setEmail, setters.setPhone, setters.setCity]);
}
