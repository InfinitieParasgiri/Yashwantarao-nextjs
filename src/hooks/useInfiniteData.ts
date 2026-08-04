import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import { getCookie } from "@/lib/cookies";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

interface UseInfiniteDataProps<T> {
  fetcher: (params: {
    page: number;
    per_page: number;
    [key: string]: any;
  }) => Promise<any>;

  perPage?: number;
  initialData?: T[];
  initialTotal?: number;
  extraParams?: {
    [key: string]: any;
  };
  passLocation?: boolean;
  forceFetchOnMount?: boolean;
  dataKey?: string | null;
}

export const useInfiniteData = <T>({
  fetcher,
  perPage = 24,
  initialData = [],
  initialTotal = 0,
  extraParams = {},
  passLocation = false,
  forceFetchOnMount = false,
  dataKey = null,
}: UseInfiniteDataProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<any>(null);

  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const extraParamsRef = useRef(extraParams);
  const passLocationRef = useRef(passLocation);
  const isFirstRender = useRef(true);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    extraParamsRef.current = extraParams;
    passLocationRef.current = passLocation;
    fetcherRef.current = fetcher;
  }, [extraParams, passLocation, fetcher]);

  const serializedParams = useMemo(
    () => JSON.stringify(extraParams),
    [extraParams],
  );

  const keyString = `${dataKey || "default"}_${serializedParams}`;
  const currentKeyRef = useRef(keyString);

  const getItemKey = useCallback((item: any) => {
    if (!item) return Math.random().toString();
    const id = item?.id ?? item?.uuid ?? "";
    const storeId =
      item?.variants?.[0]?.store_id ??
      item?.variants?.[0]?.store_slug ??
      item?.store_id ??
      item?.seller_id ??
      item?.seller ??
      "";
    const storeName = item?.variants?.[0]?.store_name ?? "";
    const variantId = item?.variants?.[0]?.id ?? "";
    return `${id}_${variantId}_${storeId}_${storeName}`;
  }, []);

  // Fetch Page 1 data whenever dataKey or params change
  useEffect(() => {
    currentKeyRef.current = keyString;

    // Skip fetch on initial SSR mount if initialData is provided and forceFetchOnMount is false
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!forceFetchOnMount && initialData.length > 0) {
        return;
      }
    }

    let isMounted = true;
    const requestKey = keyString;

    // Synchronously reset state & trigger loading UI immediately on key change
    setIsLoading(true);
    setError(null);
    setData([]);
    setTotal(0);
    setPage(1);
    currentPageRef.current = 1;
    isLoadingRef.current = false;

    const fetchInitialData = async () => {
      const { lat = "", lng = "" } =
        (getCookie("userLocation") as UserLocation) || {};

      if (passLocationRef.current && (!lat || !lng)) {
        if (isMounted && currentKeyRef.current === requestKey) {
          setData([]);
          setTotal(0);
          setIsLoading(false);
        }
        return;
      }

      const location = passLocationRef.current
        ? { latitude: lat, longitude: lng }
        : {};

      try {
        const res = await fetcherRef.current({
          page: 1,
          per_page: perPage,
          ...extraParamsRef.current,
          ...location,
        });

        if (isMounted && currentKeyRef.current === requestKey) {
          if (res?.success) {
            const items: T[] = res.data?.data || [];
            const newTotal = res.data?.total || 0;

            // Deduplicate items
            const existingKeys = new Set<string>();
            const uniqueItems: T[] = [];
            items.forEach((item) => {
              const k = getItemKey(item);
              if (!existingKeys.has(k)) {
                existingKeys.add(k);
                uniqueItems.push(item);
              }
            });

            setData(uniqueItems);
            setTotal(newTotal);
          } else {
            setData([]);
            setTotal(0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        if (isMounted && currentKeyRef.current === requestKey) {
          setError(err);
          setData([]);
          setTotal(0);
        }
      } finally {
        if (isMounted && currentKeyRef.current === requestKey) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [keyString, perPage, forceFetchOnMount, getItemKey, initialData.length]);

  const hasMore = data.length < total;

  const loadMore = useCallback(async () => {
    const requestKey = currentKeyRef.current;
    if (isLoadingRef.current || !hasMore || isLoading) {
      return;
    }

    const nextPage = currentPageRef.current + 1;

    setIsLoadingMore(true);
    isLoadingRef.current = true;

    const { lat = "", lng = "" } = getCookie("userLocation") as UserLocation;
    const location = passLocationRef.current
      ? { latitude: lat, longitude: lng }
      : {};

    try {
      const res = await fetcherRef.current({
        page: nextPage,
        per_page: perPage,
        ...extraParamsRef.current,
        ...location,
      });

      if (currentKeyRef.current !== requestKey) {
        return;
      }

      if (res?.success) {
        const newItems: T[] = res.data?.data || [];
        const newTotal = res.data?.total || 0;

        currentPageRef.current = nextPage;
        setPage(nextPage);
        setTotal(newTotal);

        setData((prev) => {
          const existingKeys = new Set(prev.map(getItemKey));
          const uniqueNewItems = newItems.filter(
            (item) => !existingKeys.has(getItemKey(item)),
          );
          return [...prev, ...uniqueNewItems];
        });
      }
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      if (currentKeyRef.current === requestKey) {
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      }
    }
  }, [perPage, hasMore, isLoading, getItemKey]);

  const refetch = useCallback(async () => {
    const requestKey = currentKeyRef.current;
    setIsLoading(true);
    setError(null);
    setData([]);
    setTotal(0);
    setPage(1);
    currentPageRef.current = 1;
    isLoadingRef.current = false;

    const { lat = "", lng = "" } =
      (getCookie("userLocation") as UserLocation) || {};

    const location = passLocationRef.current
      ? { latitude: lat, longitude: lng }
      : {};

    try {
      const res = await fetcherRef.current({
        page: 1,
        per_page: perPage,
        ...extraParamsRef.current,
        ...location,
      });

      if (currentKeyRef.current === requestKey && res?.success) {
        const items: T[] = res.data?.data || [];
        const newTotal = res.data?.total || 0;

        const existingKeys = new Set<string>();
        const uniqueItems: T[] = [];
        items.forEach((item) => {
          const k = getItemKey(item);
          if (!existingKeys.has(k)) {
            existingKeys.add(k);
            uniqueItems.push(item);
          }
        });

        setData(uniqueItems);
        setTotal(newTotal);
      }
    } catch (err) {
      console.error("Refetch failed", err);
    } finally {
      if (currentKeyRef.current === requestKey) {
        setIsLoading(false);
      }
    }
  }, [perPage, getItemKey]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    loadMore,
    error,
    refetch,
    isValidating: isLoading,
  };
};
