import { Skeleton, ListSkeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-40" />
      <Skeleton className="mb-3 h-3 w-24" />
      <ListSkeleton rows={3} />
      <Skeleton className="mb-3 mt-8 h-3 w-28" />
      <ListSkeleton rows={2} />
    </div>
  );
}
