import request from "@workspace/ui/lib/request";

interface UploadImageResponse {
  code: number;
  message: string;
  data?: {
    url?: string;
    path?: string;
  };
}

export async function uploadImage(file: File | Blob) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await request<UploadImageResponse>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/upload/image`,
    {
      method: "POST",
      data: formData,
    }
  );

  const url = resolveUploadURL(data.data);
  if (!url) {
    throw new Error(data.message || "Image upload failed");
  }
  return url;
}

function resolveUploadURL(data?: UploadImageResponse["data"]) {
  const path = data?.path;
  const apiPrefix = normalizeURLPrefix(import.meta.env.VITE_API_PREFIX || "");
  if (path && apiPrefix) {
    return `${apiPrefix}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return data?.url || path;
}

function normalizeURLPrefix(prefix: string) {
  const normalized = prefix.trim().replace(/\/+$/, "");
  return normalized === "/" ? "" : normalized;
}
