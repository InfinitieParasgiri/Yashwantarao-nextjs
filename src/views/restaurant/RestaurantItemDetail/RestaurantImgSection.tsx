import { FC, useState, useRef, memo, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Mousewheel } from "swiper/modules";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import { ProductVariant } from "@/types/ApiResponse";
import { useTranslation } from "react-i18next";

interface RestaurantImgSectionProps {
  allImages: string[];
  isLoading: boolean;
  video?: {
    url?: string | null;
    type?: "self_hosted" | "youtube" | null;
  } | null;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  variantImagesStartIndex?: number;
}

/**
 * RestaurantImgSection
 * Pixel-perfect implementation based on Figma dimensions: 472x317.
 * Optimized for food with object-cover and 20px border-radius.
 */
const RestaurantImgSection: FC<RestaurantImgSectionProps> = memo(
  ({
    allImages,
    isLoading,
    video,
    variants = [],
    selectedVariant = null,
    variantImagesStartIndex = 0,
  }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const mainSwiperRef = useRef<SwiperType | null>(null);
    const thumbnailSwiperRef = useRef<SwiperType | null>(null);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isHover, setIsHover] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
      if (selectedVariant && variants.length > 0) {
        const variantIndex = variants.findIndex((v) => v.id === selectedVariant.id);
        if (variantIndex !== -1) {
          const imageIndex = variantImagesStartIndex + variantIndex;
          if (imageIndex < allImages.length) {
            mainSwiperRef.current?.slideTo(imageIndex);
            thumbnailSwiperRef.current?.slideTo(imageIndex);
          }
        }
      }
    }, [selectedVariant, variants, variantImagesStartIndex, allImages.length]);

    const getYouTubeId = (url?: string | null) => {
      if (!url) return null;
      try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
        if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      } catch {
        const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
        return m ? m[1] : null;
      }
      return null;
    };

    const youTubeId = getYouTubeId(video?.url ?? null);
    const hasVideo = Boolean(video?.url);
    const showBottomSection = allImages.length > 1 || hasVideo;

    if (isLoading) {
      return (
        <div className="w-full max-w-[472px]">
           <div className="aspect-[472/317] w-full bg-gray-100 rounded-[20px] animate-pulse" />
        </div>
      );
    }

    if (allImages.length === 0 && !hasVideo) {
      return (
        <div className="w-full max-w-[472px]">
           <div className="aspect-[472/317] w-full bg-gray-200 dark:bg-zinc-800 rounded-[20px] flex items-center justify-center">
             <span className="text-gray-400 dark:text-zinc-500 font-medium text-sm text-center px-4">
               {t("no_image_available") || "No Image Available"}
             </span>
           </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-[472px] h-full flex flex-col gap-5">
        <div
          className="w-full cursor-zoom-in relative group"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setZoomPosition({ x, y });
          }}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          {/* Main Swiper - Fixed Figma Aspect Ratio */}
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.activeIndex);
              thumbnailSwiperRef.current?.slideTo(swiper.activeIndex);
            }}
            onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
            modules={[Navigation, Pagination, Mousewheel]}
            className="rounded-[20px] overflow-hidden"
            mousewheel
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="aspect-[472/317] w-full flex justify-center items-center bg-gray-50 overflow-hidden">
                  <img
                    src={image}
                    alt={`Main Image ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setLightboxIndex(index)}
                  />
                </div>
              </SwiperSlide>
            ))}

            {hasVideo && (
              <SwiperSlide key="video">
                <div className="aspect-[472/317] w-full flex justify-center items-center bg-black overflow-hidden">
                  {video?.type === "youtube" && youTubeId ? (
                    <iframe
                      title="product-video"
                      src={`https://www.youtube.com/embed/${youTubeId}?rel=0&showinfo=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <video
                      controls
                      src={video?.url ?? undefined}
                      className="w-full h-full object-contain bg-black"
                    />
                  )}
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Zoom Overlay */}
          {isHover && activeIndex < allImages.length && (
            <div
              className="absolute top-0 right-[-10px] w-[150px] h-[150px] border-2 border-white rounded-xl overflow-hidden shadow-xl z-50 hidden lg:block pointer-events-none bg-white"
            >
              <img
                src={allImages[activeIndex]}
                alt={`Zoomed Image ${activeIndex + 1}`}
                className="absolute w-full h-full object-cover"
                style={{
                  transform: `translate(-${zoomPosition.x}%, -${zoomPosition.y}%) scale(2)`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          )}
        </div>

        {/* Thumbnail Swiper */}
        <div className="w-full cursor-grab">
          {showBottomSection && (
            <Swiper
              spaceBetween={12}
              onSwiper={(swiper) => (thumbnailSwiperRef.current = swiper)}
              modules={[Mousewheel]}
              mousewheel
              breakpoints={{
                320: { slidesPerView: 3.2 },
                768: { slidesPerView: 4.2 },
              }}
            >
              {allImages.map((image, index) => (
                <SwiperSlide
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    mainSwiperRef.current?.slideTo(index);
                  }}
                >
                  <div
                    className={`h-20 w-full rounded-xl flex justify-center items-center bg-gray-50 active:scale-95 transition-all duration-300 overflow-hidden border-2 ${
                      activeIndex === index
                        ? "border-[#019CBF]"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    <img
                      loading="lazy"
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}

              {hasVideo && (
                <SwiperSlide
                  key="video-thumb"
                  onClick={() => {
                    const targetIndex = allImages.length;
                    setActiveIndex(targetIndex);
                    mainSwiperRef.current?.slideTo(targetIndex);
                  }}
                >
                  <div
                    className={`h-20 w-full rounded-xl flex justify-center items-center bg-gray-900 relative active:scale-95 transition-all duration-300 overflow-hidden border-2 ${
                      activeIndex === allImages.length
                        ? "border-[#019CBF]"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    {video?.type === "youtube" && youTubeId ? (
                      <img
                        loading="lazy"
                        src={`https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`}
                        alt="video thumbnail"
                        className="w-full h-full object-cover opacity-40"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                        VIDEO
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
          )}
        </div>

        {allImages.length > 0 && lightboxIndex !== null && (
          <Lightbox
            open={lightboxIndex !== null}
            index={lightboxIndex}
            plugins={[Thumbnails]}
            close={() => setLightboxIndex(null)}
            slides={allImages.map((src) => ({ src }))}
          />
        )}
      </div>
    );
  }
);

RestaurantImgSection.displayName = "RestaurantImgSection";

export default RestaurantImgSection;
