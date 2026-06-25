import { getSubscriptionCatalog } from "@workspace/ui/services/user/portal";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildSubscribeSections,
  type SubscribeCategorySection,
} from "@/sections/subscribe/catalog";
import { Content } from "./content";

export function ProductShowcase() {
  const { i18n, t } = useTranslation("main");
  const [sections, setSections] = useState<SubscribeCategorySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await getSubscriptionCatalog(
          {
            language: i18n.language,
          },
          {
            skipErrorHandler: true,
          }
        );
        setSections(
          buildSubscribeSections(data, t("uncategorized", "Uncategorized"))
        );
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [i18n.language, t]);

  if (isLoading || sections.length === 0) return null;

  return <Content sections={sections} />;
}
