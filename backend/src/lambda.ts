// src/lambda.ts
// Entry point khusus AWS Lambda - menggunakan Bun's fetch-based handler

import app from "./index";

// AWS Lambda handler menggunakan format Bun/Web Standard
export const handler = async (event: any, context: any) => {
  // Konversi Lambda Event → Web Request
  const url = `https://${event.headers?.Host ?? "localhost"}${event.rawPath ?? event.path ?? "/"}${
    event.rawQueryString ? `?${event.rawQueryString}` : ""
  }`;

  const request = new Request(url, {
    method: event.requestContext?.http?.method ?? event.httpMethod ?? "GET",
    headers: new Headers(event.headers ?? {}),
    body: event.body
      ? event.isBase64Encoded
        ? Buffer.from(event.body, "base64")
        : event.body
      : undefined,
  });

  // Kirim ke Elysia app, tangkap response
  const response = await app.handle(request);

  // Konversi Web Response → Lambda Response
  const responseBody = await response.text();
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: responseBody,
    isBase64Encoded: false,
  };
};
