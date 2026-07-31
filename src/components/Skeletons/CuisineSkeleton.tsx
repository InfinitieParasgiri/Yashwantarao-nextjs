import { Skeleton } from "@heroui/react";
import { FC } from "react";

const CuisineSkeleton: FC = () => {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full animate-pulse" />
      <Skeleton className="w-16 h-4 mt-3 rounded animate-pulse" />
    </div>
  );
};

export default CuisineSkeleton;
