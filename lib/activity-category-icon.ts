import { activityIcons } from "@/lib/activity-icons";

export function activityCategoryIcon(slug: string): string {
  const key = slug.trim().toLowerCase();
  return activityIcons[key] ?? "◆";
}
