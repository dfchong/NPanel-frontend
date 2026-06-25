import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { getSubscriptionCatalog } from "@workspace/ui/services/user/portal";
import { useTranslation } from "react-i18next";
import { flattenSubscribeCatalog } from "@/sections/subscribe/catalog";
import Content from "./content";

export default function Purchasing() {
  const { id } = useSearch({ from: "/(main)/purchasing/" }) as { id: string };
  const { i18n } = useTranslation();
  const { data } = useQuery({
    queryKey: ["subscriptionCatalog", i18n.language],
    queryFn: async () => {
      const { data } = await getSubscriptionCatalog(
        {
          language: i18n.language,
        },
        {
          skipErrorHandler: true,
        }
      );
      return flattenSubscribeCatalog(data);
    },
  });

  const subscription = data?.find((item: API.Subscribe) => item.id === id);

  return (
    <main className="container space-y-16">
      <Content subscription={subscription} />
    </main>
  );
}
