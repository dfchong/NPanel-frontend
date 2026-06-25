// @ts-ignore
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** 此处后端没有提供注释 GET /v1/public/subscribe/list */
export async function publicSubscribeQuerySubscribeList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PublicSubscribeQuerySubscribeListParams,
  options?: { [key: string]: any }
) {
  return request<API.QuerySubscribeListReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/subscribe/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /v1/public/subscribe/catalog */
export async function publicSubscribeQuerySubscribeCatalog(
  params: API.QuerySubscribeCatalogRequest,
  options?: { [key: string]: any }
) {
  return request<API.QuerySubscribeCatalogReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/subscribe/catalog`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /v1/public/subscribe/node/list */
export async function publicSubscribeQueryUserSubscribeNodeList(options?: {
  [key: string]: any;
}) {
  return request<API.QueryUserSubscribeNodeListReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/subscribe/node/list`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
