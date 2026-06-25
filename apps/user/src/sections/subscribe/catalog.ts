export type SubscribeCategorySection = {
  id: string;
  name: string;
  subscriptions: API.Subscribe[];
};

function walkCategory(
  category: API.SubscribeCategory,
  sections: SubscribeCategorySection[]
) {
  const subscriptions = (category.list || []).filter(
    (item: API.Subscribe) => item.show !== false
  );
  if (subscriptions.length > 0) {
    sections.push({
      id: String(category.id),
      name: category.name || "",
      subscriptions,
    });
  }

  for (const child of category.children || []) {
    walkCategory(child, sections);
  }
}

export function buildSubscribeSections(
  catalog?: API.QuerySubscribeCatalogReply | API.GetSubscriptionCatalogReply,
  uncategorizedLabel = "Uncategorized"
) {
  const sections: SubscribeCategorySection[] = [];
  for (const category of catalog?.categories || []) {
    walkCategory(category, sections);
  }

  const uncategorized = (catalog?.uncategorized || []).filter(
    (item: API.Subscribe) => item.show !== false
  );
  if (uncategorized.length > 0) {
    sections.push({
      id: "uncategorized",
      name: uncategorizedLabel,
      subscriptions: uncategorized,
    });
  }

  return sections;
}

export function flattenSubscribeCatalog(
  catalog?: API.QuerySubscribeCatalogReply | API.GetSubscriptionCatalogReply
) {
  return buildSubscribeSections(catalog).flatMap(
    (section) => section.subscriptions
  );
}
