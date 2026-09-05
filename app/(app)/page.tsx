import { ScreenHeader } from "@/components/ui/screen-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WeekSection } from "@/components/dashboard/week-section";
import { UpcomingSection } from "@/components/dashboard/upcoming-section";
import { getEvents } from "@/lib/data";
import { groupThisWeek, groupUpcomingByType } from "@/lib/domain/grouping";
import { DEFAULT_TIMEZONE, formatMonth, nowInTz } from "@/lib/dates";

// Fixtures compute dates relative to "now"; keep this off the static cache.
// Becomes naturally dynamic once it reads the auth session (final phase).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tz = DEFAULT_TIMEZONE;
  const now = nowInTz(tz);

  const events = await getEvents({ includeCompleted: false });

  const week = groupThisWeek(events, tz, now);
  const upcoming = groupUpcomingByType(events, tz, now);

  return (
    <>
      <ScreenHeader title={formatMonth(now, tz)} action={<SignOutButton />} />
      <WeekSection groups={week} tz={tz} />
      <UpcomingSection groups={upcoming} tz={tz} />
    </>
  );
}
