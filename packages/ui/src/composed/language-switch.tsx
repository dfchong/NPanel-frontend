import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useLanguage } from "@workspace/ui/integrations/language";
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  {
    code: "en-US",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "zh-CN",
    name: "中文",
    flag: "🇨🇳",
  },
  {
    code: "zh-TW",
    name: "繁體中文",
    flag: "🇹🇼",
  },
  {
    code: "ja-JP",
    name: "日本語",
    flag: "🇯🇵",
  },
  {
    code: "ko-KR",
    name: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "ko-KP",
    name: "조선말",
    flag: "🇰🇵",
  },
  {
    code: "vi-VN",
    name: "Tiếng Việt",
    flag: "🇻🇳",
  },
  {
    code: "ru-RU",
    name: "Русский",
    flag: "🇷🇺",
  },
  {
    code: "fa-IR",
    name: "فارسی",
    flag: "🇮🇷",
  },
  {
    code: "ar-SA",
    name: "العربية",
    flag: "🇸🇦",
  },
];

export function LanguageSwitch() {
  const { language, changeLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation("components");

  const availableLanguages = languages.filter((lang) =>
    supportedLanguages.includes(lang.code)
  );
  const currentLanguage = availableLanguages.find(
    (lang) => lang.code === language
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="scale-95 rounded-full" size="icon" variant="ghost">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language", "Language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            className="flex items-center justify-between"
            key={language.code}
            onClick={() => changeLanguage(language.code)}
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLanguage?.code === language.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
