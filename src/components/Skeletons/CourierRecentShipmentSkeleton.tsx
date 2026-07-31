import { Skeleton } from "@heroui/react";
import { FC } from "react";

const CourierRecentShipmentSkeleton: FC = () => {
  return (
    <div className="flex justify-between items-center p-6 border border-gray-100 rounded-[24px] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)] animate-pulse select-none w-full">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 text-start">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-20 h-7 rounded-full shrink-0" />
    </div>
  );
};

export default CourierRecentShipmentSkeleton;
