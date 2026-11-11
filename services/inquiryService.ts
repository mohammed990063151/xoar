import { laravelFetch } from "@/lib/laravel-fetch";
import { saveFormProfile } from "@/lib/form-profile-cookie";

export type InquiryType = "booking" | "contact" | "service" | "event_booking";

export interface EquipmentCustomizationSelection {
  key: string;
  label: string;
  value: string;
  value_label: string;
}

export interface InquiryPayload {
  type: InquiryType;
  source?: string;
  locale?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  activity_id?: number;
  event_type?: string;
  title?: string;
  description?: string;
  preferred_date?: string;
  preferred_end_date?: string;
  booking_date?: string;
  booking_end_date?: string;
  location?: string;
  guests_count?: number;
  units_count?: number;
  adults?: number;
  customer_message?: string;
  event_slug?: string;
  event_offering_id?: number;
  event_package_ids?: number[];
  equipment_offering_id?: number;
  equipment_package_ids?: number[];
  customizations?: EquipmentCustomizationSelection[];
}

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<{
  id: number;
  event_request_id?: number | null;
  equipment_request_id?: number | null;
}> {
  const response = await laravelFetch("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: {
      id: number;
      event_request_id?: number | null;
      equipment_request_id?: number | null;
    };
    errors?: Record<string, string[]>;
  };

  if (!response.ok) {
    const firstError =
      data.errors && Object.values(data.errors).flat()[0];
    throw new Error(firstError ?? data.message ?? "Request failed");
  }

  saveFormProfile({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
  });

  return {
    id: data.data?.id ?? 0,
    event_request_id: data.data?.event_request_id ?? null,
    equipment_request_id: data.data?.equipment_request_id ?? null,
  };
}
