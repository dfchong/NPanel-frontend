// @ts-ignore
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** UpdateSubscribe 更新订阅套餐 PUT /v1/admin/subscribe */
export async function subscribeUpdateSubscribe(
  body: API.UpdateSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<API.UpdateSubscribeReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export {
  subscribeUpdateSubscribe as updateSubscribe,
  subscribeCreateSubscribe as createSubscribe,
  subscribeDeleteSubscribe as deleteSubscribe,
  subscribeBatchDeleteSubscribe as batchDeleteSubscribe,
  subscribeGetSubscribeDetails as getSubscribeDetails,
  subscribeCreateSubscribeCategory as createSubscribeCategory,
  subscribeUpdateSubscribeCategory as updateSubscribeCategory,
  subscribeDeleteSubscribeCategory as deleteSubscribeCategory,
  subscribeBatchDeleteSubscribeCategory as batchDeleteSubscribeCategory,
  subscribeGetSubscribeCategoryList as getSubscribeCategoryList,
  subscribeUpdateSubscribeGroup as updateSubscribeGroup,
  subscribeCreateSubscribeGroup as createSubscribeGroup,
  subscribeDeleteSubscribeGroup as deleteSubscribeGroup,
  subscribeBatchDeleteSubscribeGroup as batchDeleteSubscribeGroup,
  subscribeGetSubscribeGroupList as getSubscribeGroupList,
  subscribeGetSubscribeList as getSubscribeList,
  subscribeResetAllSubscribeToken as resetAllSubscribeToken,
  subscribeSubscribeSort as subscribeSort,
};

/** CreateSubscribe 创建订阅套餐 POST /v1/admin/subscribe */
export async function subscribeCreateSubscribe(
  body: API.CreateSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<API.CreateSubscribeReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe`,
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

/** DeleteSubscribe 删除订阅套餐 DELETE /v1/admin/subscribe */
export async function subscribeDeleteSubscribe(
  body: API.DeleteSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<API.DeleteSubscribeReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** BatchDeleteSubscribe 批量删除订阅套餐 DELETE /v1/admin/subscribe/batch */
export async function subscribeBatchDeleteSubscribe(
  body: API.BatchDeleteSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BatchDeleteSubscribeReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** GetSubscribeDetails 获取订阅套餐详情 GET /v1/admin/subscribe/details */
export async function subscribeGetSubscribeDetails(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.SubscribeGetSubscribeDetailsParams,
  options?: { [key: string]: any }
) {
  return request<API.GetSubscribeDetailsReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/details`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** CreateSubscribeCategory 创建商品分类 POST /v1/admin/subscribe/category */
export async function subscribeCreateSubscribeCategory(
  body: API.CreateSubscribeCategoryRequest,
  options?: { [key: string]: any }
) {
  return request<API.CreateSubscribeCategoryReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/category`,
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

/** UpdateSubscribeCategory 更新商品分类 PUT /v1/admin/subscribe/category */
export async function subscribeUpdateSubscribeCategory(
  body: API.UpdateSubscribeCategoryRequest,
  options?: { [key: string]: any }
) {
  return request<API.UpdateSubscribeCategoryReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/category`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** DeleteSubscribeCategory 删除商品分类 DELETE /v1/admin/subscribe/category */
export async function subscribeDeleteSubscribeCategory(
  body: API.DeleteSubscribeCategoryRequest,
  options?: { [key: string]: any }
) {
  return request<API.DeleteSubscribeCategoryReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/category`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** BatchDeleteSubscribeCategory 批量删除商品分类 DELETE /v1/admin/subscribe/category/batch */
export async function subscribeBatchDeleteSubscribeCategory(
  body: API.BatchDeleteSubscribeCategoryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BatchDeleteSubscribeCategoryReply>(
    `${
      import.meta.env.VITE_API_PREFIX || ""
    }/v1/admin/subscribe/category/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** GetSubscribeCategoryList 获取商品分类列表 GET /v1/admin/subscribe/category/list */
export async function subscribeGetSubscribeCategoryList(
  params?: API.SubscribeGetSubscribeCategoryListParams,
  options?: { [key: string]: any }
) {
  return request<API.GetSubscribeCategoryListReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/category/list`,
    {
      method: "GET",
      params: {
        ...(params || {}),
      },
      ...(options || {}),
    }
  );
}

/** UpdateSubscribeGroup 更新订阅组 PUT /v1/admin/subscribe/group */
export async function subscribeUpdateSubscribeGroup(
  body: API.UpdateSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<API.UpdateSubscribeGroupReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/group`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** CreateSubscribeGroup 创建订阅组 POST /v1/admin/subscribe/group */
export async function subscribeCreateSubscribeGroup(
  body: API.CreateSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<API.CreateSubscribeGroupReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/group`,
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

/** DeleteSubscribeGroup 删除订阅组 DELETE /v1/admin/subscribe/group */
export async function subscribeDeleteSubscribeGroup(
  body: API.DeleteSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<API.DeleteSubscribeGroupReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/group`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** BatchDeleteSubscribeGroup 批量删除订阅组 DELETE /v1/admin/subscribe/group/batch */
export async function subscribeBatchDeleteSubscribeGroup(
  body: API.BatchDeleteSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<API.BatchDeleteSubscribeGroupReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/group/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** GetSubscribeGroupList 获取订阅组列表 GET /v1/admin/subscribe/group/list */
export async function subscribeGetSubscribeGroupList(options?: {
  [key: string]: any;
}) {
  return request<API.GetSubscribeGroupListReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/group/list`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** GetSubscribeList 获取订阅套餐列表 GET /v1/admin/subscribe/list */
export async function subscribeGetSubscribeList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.SubscribeGetSubscribeListParams,
  options?: { [key: string]: any }
) {
  return request<API.GetSubscribeListReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** ResetAllSubscribeToken 重置所有订阅Token POST /v1/admin/subscribe/reset_all_token */
export async function subscribeResetAllSubscribeToken(
  body: API.ResetAllSubscribeTokenRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResetAllSubscribeTokenReply>(
    `${
      import.meta.env.VITE_API_PREFIX || ""
    }/v1/admin/subscribe/reset_all_token`,
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

/** SubscribeSort 订阅套餐排序 POST /v1/admin/subscribe/sort */
export async function subscribeSubscribeSort(
  body: API.SubscribeSortRequest,
  options?: { [key: string]: any }
) {
  return request<API.SubscribeSortReply>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/subscribe/sort`,
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
