import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Icon } from "@workspace/ui/composed/icon";
import { Markdown } from "@workspace/ui/composed/markdown";
import { PasswordInput } from "@workspace/ui/composed/password-input";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useGlobalStore } from "@/stores/global";
import LocalCaptcha, { type LocalCaptchaRef } from "../local-captcha";
import SendCode from "../send-code";
import SliderCaptcha, { type SliderCaptchaRef } from "../slider-captcha";
import type { TurnstileRef } from "../turnstile";
import CloudFlareTurnstile from "../turnstile";

function parseEmailSuffixes(list: string) {
  return [
    ...new Set(
      list
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}

function composeEmail(local: string, suffix: string) {
  if (!(local && suffix)) return "";
  return `${local}@${suffix}`;
}

function splitEmail(email?: string) {
  if (!email?.includes("@")) {
    return { local: email || "", suffix: "" };
  }
  const [local, ...rest] = email.split("@");
  return { local: local || "", suffix: rest.join("@") || "" };
}

export default function RegisterForm({
  loading,
  onSubmit,
  initialValues,
  setInitialValues,
  onSwitchForm,
}: {
  loading?: boolean;
  onSubmit: (data: any) => void;
  initialValues: any;
  setInitialValues: Dispatch<SetStateAction<any>>;
  onSwitchForm: Dispatch<SetStateAction<"register" | "reset" | "login">>;
}) {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { verify, auth, invite } = common;
  const [captchaId, setCaptchaId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isTurnstile = verify.captcha_type === "turnstile";
  const isLocal = verify.captcha_type === "local";
  const isSlider = verify.captcha_type === "slider";
  const captchaEnabled = verify.enable_user_register_captcha;
  const enableSuffixSelect = auth.email.enable_domain_suffix;
  const suffixes = useMemo(
    () => parseEmailSuffixes(auth.email.domain_suffix_list || ""),
    [auth.email.domain_suffix_list]
  );

  const { local: initialLocal, suffix: initialSuffix } = splitEmail(
    initialValues?.email
  );
  const resolvedInitialSuffix =
    initialSuffix && suffixes.includes(initialSuffix)
      ? initialSuffix
      : suffixes[0] || "";

  const formSchema = useMemo(() => {
    const emailField = z
      .string()
      .email(t("register.email", "Please enter a valid email address"));

    return z
      .object({
        email: emailField,
        email_local: enableSuffixSelect
          ? z
              .string()
              .min(
                1,
                t(
                  "register.emailLocalRequired",
                  "Please enter your email username"
                )
              )
              .refine((value) => !value.includes("@"), {
                message: t(
                  "register.emailLocalInvalid",
                  "Do not include @ in the username"
                ),
              })
          : z.string().optional(),
        email_suffix: enableSuffixSelect
          ? z
              .string()
              .min(
                1,
                t(
                  "register.emailSuffixRequired",
                  "Please select an email suffix"
                )
              )
              .refine((value) => suffixes.includes(value), {
                message: t(
                  "register.whitelist",
                  "This email domain is not in the whitelist"
                ),
              })
          : z.string().optional(),
        password: z.string(),
        repeat_password: z.string(),
        code: auth.email.enable_verify ? z.string() : z.string().nullish(),
        invite: invite.forced_invite ? z.string().min(1) : z.string().nullish(),
        cf_token:
          captchaEnabled && isTurnstile && verify.turnstile_site_key
            ? z.string()
            : z.string().nullish(),
        captcha_code:
          captchaEnabled && isLocal
            ? z
                .string()
                .min(1, t("captcha.required", "Please enter captcha code"))
            : z.string().nullish(),
        slider_token:
          captchaEnabled && isSlider
            ? z
                .string()
                .min(
                  1,
                  t("captcha.sliderRequired", "Please complete the slider")
                )
            : z.string().optional(),
      })
      .superRefine(({ password, repeat_password }, ctx) => {
        if (password !== repeat_password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("register.passwordMismatch", "Passwords do not match"),
            path: ["repeat_password"],
          });
        }
      });
  }, [
    auth.email.enable_verify,
    captchaEnabled,
    enableSuffixSelect,
    invite.forced_invite,
    isLocal,
    isSlider,
    isTurnstile,
    suffixes,
    t,
    verify.turnstile_site_key,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cf_token: "",
      captcha_code: "",
      slider_token: "",
      ...initialValues,
      email: initialValues?.email || "",
      email_local: enableSuffixSelect ? initialLocal : "",
      email_suffix: enableSuffixSelect ? resolvedInitialSuffix : "",
      invite: localStorage.getItem("invite") || "",
    },
  });

  const emailLocal = form.watch("email_local");
  const emailSuffix = form.watch("email_suffix");
  const composedEmail = form.watch("email");

  useEffect(() => {
    if (!enableSuffixSelect) return;
    const nextEmail = composeEmail(emailLocal || "", emailSuffix || "");
    if (form.getValues("email") !== nextEmail) {
      form.setValue("email", nextEmail, { shouldValidate: false });
    }
  }, [emailLocal, emailSuffix, enableSuffixSelect, form]);

  const turnstile = useRef<TurnstileRef>(null);
  const localCaptcha = useRef<LocalCaptchaRef>(null);
  const sliderCaptcha = useRef<SliderCaptchaRef>(null);
  const handleSubmit = form.handleSubmit((data) => {
    try {
      if (isLocal && captchaEnabled) {
        (data as any).captcha_id = captchaId;
      }
      onSubmit(data);
    } catch (_error) {
      turnstile.current?.reset();
      localCaptcha.current?.reset();
      sliderCaptcha.current?.reset();
    }
  });

  const suffixSelectDisabled = enableSuffixSelect && suffixes.length === 0;

  return (
    <>
      {auth.register.stop_register ? (
        <Markdown>
          {t("register.message", "Registration is currently disabled")}
        </Markdown>
      ) : (
        <Form {...form}>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            {enableSuffixSelect ? (
              <FormItem>
                <div className="flex">
                  <FormField
                    control={form.control}
                    name="email_local"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            className="rounded-r-none border-r-0"
                            disabled={loading || suffixSelectDisabled}
                            onChange={(event) => {
                              const value = event.target.value.split("@")[0];
                              field.onChange(value);
                            }}
                            placeholder={t(
                              "register.emailLocalPlaceholder",
                              "Username"
                            )}
                            type="text"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email_suffix"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            disabled={loading || suffixSelectDisabled}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger className="w-44 rounded-l-none">
                              <SelectValue
                                placeholder={t(
                                  "register.emailSuffixPlaceholder",
                                  "Select suffix"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {suffixes.map((suffix) => (
                                <SelectItem key={suffix} value={suffix}>
                                  @{suffix}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {suffixSelectDisabled && (
                  <p className="text-destructive text-sm">
                    {t(
                      "register.noWhitelistSuffixes",
                      "No email suffixes configured"
                    )}
                  </p>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={() => (
                    <FormItem className="hidden">
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "register.emailPlaceholder",
                          "Enter your email..."
                        )}
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {auth.email.enable_verify && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          disabled={loading}
                          placeholder={t(
                            "register.codePlaceholder",
                            "Enter code..."
                          )}
                          type="text"
                          {...field}
                          value={field.value as string}
                        />
                        <SendCode
                          params={{
                            email: composedEmail,
                            type: 1,
                          }}
                          type="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      onShowPasswordChange={setShowPassword}
                      placeholder={t(
                        "register.passwordPlaceholder",
                        "Enter your password..."
                      )}
                      showPassword={showPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeat_password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      disabled={loading}
                      onShowPasswordChange={setShowPassword}
                      placeholder={t(
                        "register.repeatPasswordPlaceholder",
                        "Enter password again..."
                      )}
                      showPassword={showPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invite"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={loading || !!localStorage.getItem("invite")}
                      placeholder={t(
                        "register.invite",
                        "Invitation Code (Optional)"
                      )}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {captchaEnabled && isTurnstile && (
              <FormField
                control={form.control}
                name="cf_token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CloudFlareTurnstile
                        id="register"
                        {...field}
                        ref={turnstile}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {captchaEnabled && isLocal && (
              <FormField
                control={form.control}
                name="captcha_code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <LocalCaptcha
                        {...field}
                        onCaptchaIdChange={setCaptchaId}
                        ref={localCaptcha}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {captchaEnabled && isSlider && (
              <FormField
                control={form.control}
                name="slider_token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SliderCaptcha {...field} ref={sliderCaptcha} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button disabled={loading || suffixSelectDisabled} type="submit">
              {loading && <Icon className="animate-spin" icon="mdi:loading" />}
              {t("register.title", "Register")}
            </Button>
          </form>
        </Form>
      )}
      <div className="mt-4 text-right text-sm">
        {t("register.existingAccount", "Already have an account?")}&nbsp;
        <Button
          className="p-0"
          onClick={() => {
            setInitialValues(undefined);
            onSwitchForm("login");
          }}
          variant="link"
        >
          {t("register.switchToLogin", "Login")}
        </Button>
      </div>
    </>
  );
}
