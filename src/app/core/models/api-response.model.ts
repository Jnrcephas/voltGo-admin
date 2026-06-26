/**
 * VoltGo's admin API responds with one of two envelope shapes depending on
 * the endpoint family:
 *
 *  - Most `/admin/*` endpoints: `{ status, message, data }`
 *  - Error responses and a few simple endpoints: `{ success, message }`
 *
 * These wrapper types model both so services can unwrap consistently.
 */
export interface ApiSuccessEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
}

/** Generic flag-style success response with no payload, e.g. logout. */
export interface ApiSimpleSuccess {
  success?: boolean;
  status?: number;
  message: string;
}

/**
 * Standard pagination wrapper used by list endpoints
 * (e.g. `/admin/users`, `/admin/riders`, `/admin/orders`).
 *
 * The backend nests the array under a domain-specific key (e.g. `users`,
 * `riders`), so each service's response type declares that key explicitly.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
