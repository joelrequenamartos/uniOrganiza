import { EmptyState, ScreenHeader } from "@/components/ui/screen-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WeekSection } from "@/components/dashboard/week-section";
import { UpcomingSection } from "@/components/dashboard/upcoming-section";
import { SubjectChips } from "@/components/dashboard/subject-chips";
import { getEvents, getSubjects } from "@/lib/data";
import {
  groupOverdueByType,
  groupThisWeek,
  groupUpcomingByType,
} from "@/lib/domain/grouping";
import { DEFAULT_TIMEZONE, formatMonth, nowInTz } from "@/lib/dates";

// Reads the auth session and live data; never statically cached.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tz = DEFAULT_TIMEZONE;
  const now = nowInTz(tz);

  const [events, subjects] = await Promise.all([
    getEvents({ includeCompleted: false }),
    getSubjects(),
  ]);

  const week = groupThisWeek(events, tz, now);
  const overdue = groupOverdueByType(events, tz, now);
  const upcoming = groupUpcomingByType(events, tz, now);
  const nothing =
    overdue.length === 0 && week.length === 0 && upcoming.length === 0;

  return (
    <>
      <ScreenHeader title={formatMonth(now, tz)} action={<SignOutButton />} />
      {nothing ? (
        <EmptyState
          title="Todo en orden"
          hint="No tienes clases esta semana ni entregas, exámenes o actividades a la vista. Usa el botón + para añadir algo."
        />
      ) : (
        <>
          {overdue.length > 0 && (
            <UpcomingSection groups={overdue} tz={tz} variant="overdue" />
          )}
          <SubjectChips subjects={subjects} />
          <WeekSection groups={week} tz={tz} />
          <UpcomingSection groups={upcoming} tz={tz} />
        </>
      )}
    </>
  );
}
