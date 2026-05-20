export type InquiryType = "booking" | "contact" | "service";

export interface InquiryPayload {
  type: InquiryType;
  source?: string;
  locale?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE}/api/inquiries`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: { id: number };
    errors?: Record<string, string[]>;
  };

  if (!response.ok) {
    const firstError =
      data.errors && Object.values(data.errors).flat()[0];
    throw new Error(firstError ?? data.message ?? "Request failed");
  }

  return { id: data.data?.id ?? 0 };
}
