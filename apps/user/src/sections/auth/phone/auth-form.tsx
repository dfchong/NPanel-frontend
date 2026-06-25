"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  telephoneLogin,
  telephoneResetPassword,
  telephoneUserRegister,
} from "@workspace/ui/services/common/auth";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useGlobalStore } from "@/stores/global";
import { getRedirectUrl, setAuthorization } from "@/utils/common";
import type { AuthFormType } from "../types";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import ResetForm from "./reset-form";

type PhoneAuthFormProps = {
  formType?: AuthFormType;
  onFormTypeChange?: Dispatch<SetStateAction<AuthFormType>>;
};

export default function PhoneAuthForm({
  formType: controlledFormType,
  onFormTypeChange,
}: PhoneAuthFormProps = {}) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { getUserInfo } = useGlobalStore();
  const searchParams = useSearch({ strict: false }) as { invite?: string };
  const [internalFormType, setInternalFormType] =
    useState<AuthFormType>("login");
  const formType = controlledFormType ?? internalFormType;
  const setFormType = onFormTypeChange ?? setInternalFormType;
  const [loading, startTransition] = useTransition();
  const [initialValues, setInitialValues] = useState<API.TelephoneLoginRequest>(
    {
      identifier: "",
      telephone: "",
      telephone_area_code: "1",
      password: "",
      telephone_code: "",
    }
  );

  useEffect(() => {
    if (searchParams.invite) {
      localStorage.setItem("invite", searchParams.invite);
      setInitialValues((prev) => ({ ...prev, invite: searchParams.invite }));
    }
  }, [searchParams.invite]);

  const handleFormSubmit = async (params: any) => {
    const onLogin = async (token?: string) => {
      if (!token) return;
      setAuthorization(token);
      await getUserInfo();
      navigate({ to: getRedirectUrl() });
    };
    startTransition(async () => {
      try {
        switch (formType) {
          case "login": {
            const login = await telephoneLogin(params);
            toast.success(t("login.success", "Login successful!"));
            onLogin(login.data.data?.token);
            break;
          }
          case "register": {
            const create = await telephoneUserRegister(params);
            toast.success(t("register.success", "Registration successful!"));
            onLogin(create.data.data?.token);
            break;
          }
          case "reset":
            await telephoneResetPassword(params);
            toast.success(t("reset.success", "Password reset successful!"));
            setFormType("login");
            break;
        }
      } catch (_error) {
        /* empty */
      }
    });
  };

  let UserForm: ReactNode = null;
  switch (formType) {
    case "login":
      UserForm = (
        <LoginForm
          initialValues={initialValues}
          loading={loading}
          onSubmit={handleFormSubmit}
          onSwitchForm={setFormType}
        />
      );
      break;
    case "register":
      UserForm = (
        <RegisterForm
          initialValues={initialValues}
          loading={loading}
          onSubmit={handleFormSubmit}
          onSwitchForm={setFormType}
        />
      );
      break;
    case "reset":
      UserForm = (
        <ResetForm
          initialValues={initialValues}
          loading={loading}
          onSubmit={handleFormSubmit}
          onSwitchForm={setFormType}
          setInitialValues={setInitialValues}
        />
      );
      break;
  }

  return UserForm;
}
