import { Skeleton } from "@heroui/react";
import { FC } from "react";

const CourierActiveShipmentSkeleton: FC = () => {
  return (
    <div className="w-full bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.025)] p-6 relative overflow-hidden flex flex-col justify-between gap-6 animate-pulse select-none min-h-[220px]">
      {/* Top Section */}
      <div className="flex items-center justify-between pr-20 relative">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 text-start">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>
        </div>
        {/* Floating Status Tag skeleton at top right */}
        <Skeleton className="absolute top-0 right-0 w-20 h-6 rounded-full shrink-0" />
      </div>

      {/* Middle Section (Timeline line) */}
      <div className="w-full pr-24 sm:pr-28 pt-7">
        <div className="flex items-center gap-1">
          {/* Left circle */}
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
          {/* Line */}
          <Skeleton className="flex-1 h-[2px]" />
          {/* Right circle */}
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
        </div>
      </div>

      {/* Bottom Section (Addresses) */}
      <div className="w-full pr-24 sm:pr-28">
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2 text-start">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <div className="flex-1 flex flex-col gap-2 text-start">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierActiveShipmentSkeleton;
