// @ts-ignore
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** 此处后端没有提供注释 POST /v1/public/portal/order/checkout */
export async function portalPurchaseCheckout(
  body: API.PurchaseCheckoutRequest,
  options?: { [key: string]: any }
) {
  return request<API.PurchaseCheckoutReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/portal/order/checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export const purchaseCheckout: (...args: any[]) => Promise<any> =
  portalPurchaseCheckout as any;
export const queryPurchaseOrder: (...args: any[]) => Promise<any> =
  portalQueryPurchaseOrder as any;
export const getAvailablePaymentMethods: (...args: any[]) => Promise<any> =
  portalGetAvailablePaymentMethods as any;
export const prePurchaseOrder: (...args: any[]) => Promise<any> =
  portalPrePurchaseOrder as any;
export const purchase: (...args: any[]) => Promise<any> = portalPurchase as any;
export const getSubscription: (...args: any[]) => Promise<any> =
  portalGetSubscription as any;
export const getSubscriptionCatalog: (...args: any[]) => Promise<any> =
  portalGetSubscriptionCatalog as any;

/** 此处后端没有提供注释 GET /v1/public/portal/order/status */
export async function portalQueryPurchaseOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PortalQueryPurchaseOrderParams,
  options?: { [key: string]: any }
) {
  return request<API.QueryPurchaseOrderReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/portal/order/status`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /v1/public/portal/payment-method */
export async function portalGetAvailablePaymentMethods(options?: {
  [key: string]: any;
}) {
  return request<API.GetAvailablePaymentMethodsReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/portal/payment-method`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /v1/public/portal/pre */
export async function portalPrePurchaseOrder(
  body: API.PrePurchaseOrderRequest,
  options?: { [key: string]: any }
) {
  return request<API.PrePurchaseOrderReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/portal/pre`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /v1/public/portal/purchase */
export async function portalPurchase(
  body: API.PurchaseRequest,
  options?: { [key: string]: any }
) {
  return request<API.PurchaseReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/portal/purchase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /v1/public/portal/subscribe */
export async function portalGetSubscription(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PortalGetSubscriptionParams,
  options?: { [key: string]: any }
) {
  return request<API.GetSubscriptionReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/portal/subscribe`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /v1/public/portal/subscribe/catalog */
export async function portalGetSubscriptionCatalog(
  params: API.GetSubscriptionCatalogRequest,
  options?: { [key: string]: any }
) {
  return request<API.GetSubscriptionCatalogReply>(
    `${
      import.meta.env.VITE_API_PREFIX || ""
    }/v1/public/portal/subscribe/catalog`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}
