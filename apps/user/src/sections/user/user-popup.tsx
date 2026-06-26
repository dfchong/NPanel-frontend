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

type AdPopup = {
  kind: "ad";
  id?: number | string;
  title?: string;
  ad: Ad;
};

type PopupItem = AnnouncementPopup | AdPopup;

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
      // biome-ignore lint/a11y/useMediaCaption: Ad video sources are configured externally and do not provide caption tracks.
      <video
        className="max-h-[60vh] w-full rounded-md bg-muted object-contain"
        controls
        src={ad.content}
      />
    );
  }

  if (ad.type === "image" && ad.content) {
    return (
      <img
        alt={ad.title || "Advertisement"}
        className="max-h-[60vh] w-full rounded-md object-contain"
        height={540}
        src={ad.content}
        width={960}
      />
    );
  }

  return null;
}

export default function UserPopup() {
  const { user } = useGlobalStore();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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
    const activeAd = ads
      ?.filter((ad) => isActiveAd(ad, now))
      .sort(compareAds)[0];
    if (activeAd) {
      items.push({
        kind: "ad",
        id: activeAd.id,
        title: activeAd.title,
        ad: activeAd,
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

          return `ad:${item.id ?? item.title ?? item.ad.content ?? ""}`;
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
    setOpen(true);
  }, [popupKey]);

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

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{activePopup.title}</DialogTitle>
        </DialogHeader>
        {activePopup.kind === "announcement" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown>{activePopup.content || ""}</Markdown>
          </div>
        ) : (
          <div className="space-y-4">
            <AdContent ad={activePopup.ad} />
            {activePopup.ad.description ? (
              <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                {activePopup.ad.description}
              </p>
            ) : null}
            {activePopup.ad.target_url ? (
              <Button asChild className="w-full">
                <a
                  href={activePopup.ad.target_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {activePopup.ad.target_url}
                </a>
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
