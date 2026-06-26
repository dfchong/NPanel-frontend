"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Textarea } from "@workspace/ui/components/textarea";
import { Combobox } from "@workspace/ui/composed/combobox";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import {
  createSubscribeCategory,
  deleteSubscribeCategory,
  getSubscribeCategoryList,
  updateSubscribeCategory,
} from "@workspace/ui/services/admin/subscribe";
import { Pencil, Plus, Tags } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type CategoryDraft = {
  id?: number;
  parent_id: string;
  name: string;
  description: string;
  language: string;
  show: boolean;
  sort: number;
};

const emptyDraft: CategoryDraft = {
  parent_id: "",
  name: "",
  description: "",
  language: "",
  show: true,
  sort: 0,
};

const categoryDefaultsZh = {
  actions: "操作",
  create: "创建分类",
  createSuccess: "分类创建成功",
  deleteSuccess: "分类删除成功",
  deleteWarning: "删除分类前请确认没有子分类或绑定套餐。",
  description: "分类描述",
  defaultLanguage: "默认 / 不限制语言",
  language: "语言",
  manage: "分类管理",
  name: "分类名称",
  new: "新建",
  parent: "父分类",
  root: "根分类",
  save: "保存分类",
  show: "显示",
  sort: "排序",
  updateSuccess: "分类更新成功",
} as const;

type CategoryDefaultKey = keyof typeof categoryDefaultsZh;

const categoryDefaultsEn: Record<CategoryDefaultKey, string> = {
  actions: "Actions",
  create: "Create Category",
  createSuccess: "Category created successfully",
  deleteSuccess: "Category deleted successfully",
  deleteWarning:
    "Make sure the category has no child categories or linked plans before deleting it.",
  description: "Description",
  defaultLanguage: "Default / no restriction",
  language: "Language",
  manage: "Manage Categories",
  name: "Category Name",
  new: "New",
  parent: "Parent Category",
  root: "Root Category",
  save: "Save Category",
  show: "Show",
  sort: "Sort",
  updateSuccess: "Category updated successfully",
};

function normalizeCategory(category: API.SubscribeCategoryInfo): CategoryDraft {
  return {
    id: Number(category.id),
    parent_id: category.parent_id ? String(category.parent_id) : "",
    name: category.name || "",
    description: category.description || "",
    language: category.language || "",
    show: category.show ?? true,
    sort: Number(category.sort ?? 0),
  };
}

function flattenCategories(categories: API.SubscribeCategoryInfo[]) {
  const childrenMap = new Map<string, API.SubscribeCategoryInfo[]>();
  const roots: API.SubscribeCategoryInfo[] = [];

  for (const category of categories) {
    const parentID = String(category.parent_id || "");
    if (!parentID || parentID === "0") {
      roots.push(category);
      continue;
    }
    const children = childrenMap.get(parentID) || [];
    children.push(category);
    childrenMap.set(parentID, children);
  }

  const result: Array<API.SubscribeCategoryInfo & { depth: number }> = [];
  const walk = (items: API.SubscribeCategoryInfo[], depth: number) => {
    for (const item of items) {
      result.push({ ...item, depth });
      walk(childrenMap.get(String(item.id)) || [], depth + 1);
    }
  };

  walk(roots, 0);

  const included = new Set(result.map((item) => String(item.id)));
  const orphans = categories.filter((item) => !included.has(String(item.id)));
  walk(orphans, 0);

  return result;
}

function toCategoryPayload(draft: CategoryDraft) {
  return {
    parent_id: draft.parent_id ? Number(draft.parent_id) : 0,
    name: draft.name.trim(),
    description: draft.description,
    language: draft.language.trim(),
    show: draft.show,
    sort: Number(draft.sort || 0),
  };
}

export default function CategoryManager({
  onChanged,
}: Readonly<{
  onChanged?: () => void;
}>) {
  const { i18n, t } = useTranslation("product");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const categoryDefaults: Record<CategoryDefaultKey, string> =
    i18n.resolvedLanguage?.startsWith("zh")
      ? categoryDefaultsZh
      : categoryDefaultsEn;
  const tc = useCallback(
    (key: CategoryDefaultKey) =>
      t(`category.${key}`, { defaultValue: categoryDefaults[key] }),
    [categoryDefaults, t]
  );

  const { data: categories = [] } = useQuery({
    queryKey: ["subscribeCategories"],
    queryFn: async () => {
      const { data } = await getSubscribeCategoryList({});
      return data.data?.list || [];
    },
  });

  const sortedCategories = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const parentOptions = useMemo(
    () => [
      { label: tc("root"), value: "" },
      ...sortedCategories
        .filter((item) => String(item.id) !== String(draft.id || ""))
        .map((item) => ({
          label: `${"　".repeat(item.depth)}${item.name}`,
          value: String(item.id),
        })),
    ],
    [draft.id, sortedCategories, tc]
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["subscribeCategories"] });
    onChanged?.();
  };

  const resetDraft = () => setDraft(emptyDraft);

  const handleSubmit = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      const payload = toCategoryPayload(draft);
      if (draft.id) {
        await updateSubscribeCategory({ id: draft.id, ...payload });
        toast.success(tc("updateSuccess"));
      } else {
        await createSubscribeCategory(payload);
        toast.success(tc("createSuccess"));
      }
      resetDraft();
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetDraft();
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Tags className="size-4" />
          {tc("manage")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{tc("manage")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 overflow-auto md:grid-cols-[320px_1fr]">
          <div className="grid content-start gap-4">
            <div className="grid gap-2">
              <Label>{tc("name")}</Label>
              <Input
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                value={draft.name}
              />
            </div>
            <div className="grid gap-2">
              <Label>{tc("parent")}</Label>
              <Combobox
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    parent_id: String(value || ""),
                  }))
                }
                options={parentOptions}
                placeholder={tc("root")}
                value={draft.parent_id}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{tc("language")}</Label>
                <Select
                  onValueChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      language: value === "__default__" ? "" : value,
                    }))
                  }
                  value={draft.language || "__default__"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="zh-CN" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">
                      {tc("defaultLanguage")}
                    </SelectItem>
                    <SelectItem value="en-US">en-US</SelectItem>
                    <SelectItem value="zh-CN">zh-CN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{tc("sort")}</Label>
                <Input
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      sort: Number(event.target.value || 0),
                    }))
                  }
                  type="number"
                  value={draft.sort}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{tc("description")}</Label>
              <Textarea
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                value={draft.description}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label>{tc("show")}</Label>
              <Switch
                checked={draft.show}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, show: checked }))
                }
              />
            </div>
            <DialogFooter>
              {draft.id && (
                <Button onClick={resetDraft} type="button" variant="outline">
                  <Plus className="size-4" />
                  {tc("new")}
                </Button>
              )}
              <Button
                disabled={saving || !draft.name.trim()}
                onClick={handleSubmit}
              >
                {draft.id ? tc("save") : tc("create")}
              </Button>
            </DialogFooter>
          </div>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tc("name")}</TableHead>
                  <TableHead>{tc("language")}</TableHead>
                  <TableHead>{tc("show")}</TableHead>
                  <TableHead className="text-right">{tc("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => (
                  <TableRow key={String(category.id)}>
                    <TableCell>
                      <span style={{ paddingLeft: category.depth * 16 }}>
                        {category.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {category.language ? (
                        <Badge variant="outline">{category.language}</Badge>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={category.show}
                        onCheckedChange={async (checked) => {
                          await updateSubscribeCategory({
                            id: category.id,
                            parent_id: category.parent_id || 0,
                            name: category.name,
                            description: category.description || "",
                            language: category.language || "",
                            show: checked,
                            sort: category.sort || 0,
                          });
                          await refresh();
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => setDraft(normalizeCategory(category))}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Pencil className="size-4" />
                          {t("edit")}
                        </Button>
                        <ConfirmButton
                          cancelText={t("cancel")}
                          confirmText={t("confirm")}
                          description={tc("deleteWarning")}
                          onConfirm={async () => {
                            await deleteSubscribeCategory({ id: category.id });
                            toast.success(tc("deleteSuccess"));
                            await refresh();
                          }}
                          title={t("confirmDelete")}
                          trigger={
                            <Button size="sm" variant="destructive">
                              {t("delete")}
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
