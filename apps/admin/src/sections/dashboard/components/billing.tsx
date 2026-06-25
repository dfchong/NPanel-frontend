import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useTranslation } from "react-i18next";

interface BillingProps {
  type: "dashboard" | "payment";
}

interface ItemType {
  logo: string;
  title: string;
  description: string;
  expiryDate: string;
  href: string;
}

const BILLING_URL =
  "https://cdn.jsdmirror.com/gh/npanel-dev/NPanel-assets/billing/index.json";

export default function Billing({ type }: BillingProps) {
  const { t } = useTranslation("dashboard");

  const { data: list } = useQuery({
    queryKey: ["billing", type],
    queryFn: async () => {
      try {
        const response = await fetch(BILLING_URL, {
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) return [];
        const data = await response.json();
        const now = Date.now();

        return Array.isArray(data[type])
          ? data[type].filter((item: { expiryDate: string }) => {
              const expiryDate = Date.parse(item.expiryDate);
              return !Number.isNaN(expiryDate) && expiryDate > now;
            })
          : [];
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  if (!list?.length) return null;

  return (
    <>
      <h1 className="text mt-2 font-bold">
        <span>{t("billing.title", "Sponsor")}</span>
        <span className="ml-2 text-muted-foreground text-xs">
          {t(
            "billing.description",
            "Sponsoring revenue will empower NPanel's continuous iteration"
          )}
        </span>
      </h1>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {list.map((item: ItemType, index: number) => (
          <a
            href={item.href}
            key={index}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Card className="h-full cursor-pointer">
              <CardHeader className="flex flex-row gap-2 p-3">
                <Avatar>
                  <AvatarImage src={item.logo} />
                  <AvatarFallback>{item.title}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}
