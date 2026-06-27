"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Markdown } from "@workspace/ui/composed/markdown";
import { getAds } from "@workspace/ui/services/common/common";
import { queryAnnouncement } from "@workspace/ui/services/user/announcement";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalStore } from "@/stores/global";

type Ad = {
  id?: number | string;
  title?: string;
  type?: string;
  content?: string;
  description?: string;
  target_url?: string;
  start_time?: number | string;
  end_time?: number | string;
  status?: number | string;
  created_at?: number | string;
};

type AnnouncementPopup = {
  kind: "announcement";
  id?: number | string;
  title?: string;
  content?: string;
};

type AdsPopup = {
  kind: "ads";
  id: string;
  ads: Ad[];
};

type PopupItem = AnnouncementPopup | AdsPopup;

function toTimestamp(value: unknown) {
  const timestamp = Number(value ?? 0);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 0;
  return timestamp > 10_000_000_000 ? Math.floor(timestamp / 1000) : timestamp;
}

function isActiveAd(ad: Ad, now: number) {
  const startTime = toTimestamp(ad.start_time);
  const endTime = toTimestamp(ad.end_time);

  return (
    Number(ad.status ?? 0) === 1 &&
    (startTime === 0 || startTime <= now) &&
    (endTime === 0 || endTime >= now)
  );
}

function compareAds(left: Ad, right: Ad) {
  return (
    toTimestamp(right.start_time) - toTimestamp(left.start_time) ||
    toTimestamp(right.created_at) - toTimestamp(left.created_at) ||
    Number(right.id ?? 0) - Number(left.id ?? 0)
  );
}

function AdContent({ ad }: { ad: Ad }) {
  if (ad.type === "video" && ad.content) {
    return (
      <div className="flex aspect-video max-h-[60vh] w-full items-center justify-center overflow-hidden rounded-md bg-muted/60">
        {/* biome-ignore lint/a11y/useMediaCaption: Ad video sources are configured externally and do not provide caption tracks. */}
        <video
          className="h-full w-full object-contain"
          controls
          src={ad.content}
        />
      </div>
    );
  }

  if (ad.type === "image" && ad.content) {
    return (
      <div className="flex aspect-video max-h-[60vh] w-full items-center justify-center overflow-hidden rounded-md bg-muted/60">
        <img
          alt={ad.title || "Advertisement"}
          className="h-full w-full object-contain"
          height={540}
          src={ad.content}
          width={960}
        />
      </div>
    );
  }

  return null;
}

function AdCarousel({
  ads,
  activeAdIndex,
  onActiveAdIndexChange,
}: {
  ads: Ad[];
  activeAdIndex: number;
  onActiveAdIndexChange: (index: number) => void;
}) {
  const activeAd = ads[activeAdIndex];

  if (!activeAd) return null;

  const hasMultipleAds = ads.length > 1;

  function showPreviousAd() {
    onActiveAdIndexChange((activeAdIndex - 1 + ads.length) % ads.length);
  }

  function showNextAd() {
    onActiveAdIndexChange((activeAdIndex + 1) % ads.length);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <AdContent ad={activeAd} />
        {hasMultipleAds ? (
          <>
            <Button
              aria-label="Previous advertisement"
              className="-translate-y-1/2 absolute top-1/2 left-2 size-8 rounded-full bg-background/80 shadow-sm backdrop-blur"
              onClick={showPreviousAd}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              aria-label="Next advertisement"
              className="-translate-y-1/2 absolute top-1/2 right-2 size-8 rounded-full bg-background/80 shadow-sm backdrop-blur"
              onClick={showNextAd}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </>
        ) : null}
      </div>
      {activeAd.description ? (
        <p className="whitespace-pre-wrap text-muted-foreground text-sm">
          {activeAd.description}
        </p>
      ) : null}
      {activeAd.target_url ? (
        <Button asChild className="w-full">
          <a
            href={activeAd.target_url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
            查看详情
          </a>
        </Button>
      ) : null}
      {hasMultipleAds ? (
        <div className="flex items-center justify-center gap-2">
          {ads.map((ad, index) => (
            <button
              aria-label={`Show advertisement ${index + 1}`}
              className={`size-2 rounded-full transition-colors ${
                index === activeAdIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              }`}
              key={`${ad.id ?? ad.title ?? ad.content ?? "ad"}-${index}`}
              onClick={() => onActiveAdIndexChange(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function UserPopup() {
  const { user } = useGlobalStore();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const shownPopupKeyRef = useRef("");

  const { data: announcement, isFetched: announcementFetched } = useQuery({
    queryKey: ["announcement", "popup"],
    queryFn: async () => {
      const result = await queryAnnouncement(
        {
          page: 1,
          size: 1,
          popup: true,
        },
        {
          skipErrorHandler: true,
        }
      );
      return (
        result.data.data?.announcements?.[0] ||
        result.data.announcements?.[0] ||
        null
      );
    },
    enabled: !!user,
  });

  const { data: ads, isFetched: adsFetched } = useQuery({
    queryKey: ["common-ads"],
    queryFn: async () => {
      const result = await getAds(
        {
          device: "web",
          position: "popup",
        },
        {
          skipErrorHandler: true,
        }
      );
      return (result.data?.data?.list || result.data?.list || []) as Ad[];
    },
    enabled: !!user,
  });

  const popups = useMemo<PopupItem[]>(() => {
    if (!(announcementFetched && adsFetched)) return [];

    const items: PopupItem[] = [];

    if (announcement) {
      items.push({
        kind: "announcement",
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const activeAds =
      ads?.filter((ad) => isActiveAd(ad, now)).sort(compareAds) || [];
    if (activeAds.length > 0) {
      items.push({
        kind: "ads",
        id: activeAds
          .map((ad) => ad.id ?? ad.title ?? ad.content ?? "")
          .join(","),
        ads: activeAds,
      });
    }

    return items;
  }, [ads, adsFetched, announcement, announcementFetched]);

  const activePopup = popups[activeIndex];
  const popupKey = useMemo(
    () =>
      popups
        .map((item) => {
          if (item.kind === "announcement") {
            return `announcement:${item.id ?? item.title ?? ""}`;
          }

          return `ads:${item.id}`;
        })
        .join("|"),
    [popups]
  );

  useEffect(() => {
    if (!popupKey) {
      setOpen(false);
      return;
    }
    if (shownPopupKeyRef.current === popupKey) return;

    shownPopupKeyRef.current = popupKey;
    setActiveIndex(0);
    setActiveAdIndex(0);
    setOpen(true);
  }, [popupKey]);

  useEffect(() => {
    if (activePopup?.kind !== "ads") {
      setActiveAdIndex(0);
      return;
    }

    setActiveAdIndex((index) =>
      Math.min(index, Math.max(activePopup.ads.length - 1, 0))
    );
  }, [activePopup]);

  useEffect(() => {
    if (!(open && activePopup?.kind === "ads" && activePopup.ads.length > 1)) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveAdIndex((index) => (index + 1) % activePopup.ads.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [activePopup, open]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    const nextIndex = activeIndex + 1;
    if (nextIndex < popups.length) {
      setOpen(false);
      window.setTimeout(() => {
        setActiveIndex(nextIndex);
        setOpen(true);
      }, 150);
      return;
    }

    setOpen(false);
  }

  if (!activePopup) return null;

  const activeAd =
    activePopup.kind === "ads" ? activePopup.ads[activeAdIndex] : null;

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {activePopup.kind === "announcement"
              ? activePopup.title
              : activeAd?.title}
          </DialogTitle>
        </DialogHeader>
        {activePopup.kind === "announcement" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown>{activePopup.content || ""}</Markdown>
          </div>
        ) : (
          <AdCarousel
            activeAdIndex={activeAdIndex}
            ads={activePopup.ads}
            onActiveAdIndexChange={setActiveAdIndex}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
