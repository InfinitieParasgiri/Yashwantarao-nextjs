import { Skeleton, Card } from "@heroui/react";
import { FC } from "react";

const RestaurantCardSkeleton: FC = () => {
  return (
    <Card className="flex flex-col rounded-[20px] p-3 overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 m-1">
      {/* Image Placeholder */}
      <Skeleton className="h-44 sm:h-48 md:h-52 w-full rounded-[16px] mb-3" />
      
      <div className="px-1 flex flex-col gap-3">
        {/* Rating and Veg Indicator Placeholder */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-12 h-6 rounded-md" />
          <Skeleton className="w-24 h-6 rounded-lg" />
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Title Placeholder */}
          <Skeleton className="w-3/4 h-6 rounded-lg" />
          
          {/* Meta Info Placeholder */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-4 rounded-md" />
            <Skeleton className="w-12 h-4 rounded-md" />
            <Skeleton className="w-14 h-4 rounded-md" />
          </div>

          {/* Offer Placeholder */}
          <Skeleton className="w-1/2 h-4 mt-1 rounded-md" />
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCardSkeleton;
