import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../state/auth.store';

/**
 * Normalized application-level error thrown for every failed HTTP call.
 * Components/services can rely on `.message` always being a human-readable
 * string regardless of which envelope shape the backend returned.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error;

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (typeof body.data?.message === 'string') {
      return body.data.message;
    }
  }

  if (err.status === 0) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  return err.statusText || `Request failed with status ${err.status}`;
}

/**
 * Handles two cross-cutting concerns for every API response:
 *  1. Normalizes errors into a single `ApiError` shape.
 *  2. On 401 (expired/invalid token), clears the session and redirects to
 *     /login — except when the 401 came from the login call itself, since
 *     that's just "wrong password", not "session expired".
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const isLoginRequest = req.url.includes('/admin/auth/login');

        if (err.status === 401 && !isLoginRequest) {
          authStore.clearSession();
          router.navigate(['/login'], { queryParams: { sessionExpired: '1' } });
        }

        return throwError(() => new ApiError(extractMessage(err), err.status, err.error));
      }

      return throwError(() => err);
    }),
  );
};
