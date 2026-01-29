// Frontend/src/api/client.js

/**
 * Lightweight fetch client for your API.
 * - Handles JSON automatically
 * - Throws useful errors with status + message
 * - Works with CRA proxy OR direct backend URL
 */

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // sometimes servers return plain text errors
  }
}

export async function apiRequest(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 60000,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  const fetchOptions = {
    method,
    headers: finalHeaders,
    signal: controller.signal,
  };

  if (body !== undefined) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const message =
        (data && data.error) ||
        (data && data.message) ||
        (typeof data === "string" ? data : "Request failed");

      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Convenience helpers
export function get(url, options = {}) {
  return apiRequest(url, { ...options, method: "GET" });
}

export function post(url, body, options = {}) {
  return apiRequest(url, { ...options, method: "POST", body });
}

export function put(url, body, options = {}) {
  return apiRequest(url, { ...options, method: "PUT", body });
}

export function del(url, options = {}) {
  return apiRequest(url, { ...options, method: "DELETE" });
}
