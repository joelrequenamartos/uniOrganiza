import { MonthView } from "@/components/calendar/month-view";
import { SubjectLegend } from "@/components/calendar/legend";
import { getEvents, getSubjects } from "@/lib/data";
import { DEFAULT_TIMEZONE } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const tz = DEFAULT_TIMEZONE;
  const [events, subjects] = await Promise.all([getEvents(), getSubjects()]);

  return (
    <>
      <MonthView events={events} tz={tz} />
      <SubjectLegend subjects={subjects} />
    </>
  );
}
