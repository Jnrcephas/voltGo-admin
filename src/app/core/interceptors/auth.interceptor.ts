import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../state/auth.store';

/**
 * Attaches `Authorization: Bearer <token>` to every outgoing request that
 * targets the VoltGo API. Requests to other origins (e.g. the runtime
 * config.json fetch, or any third-party URL) are left untouched.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();

  if (!token || !req.url.includes('/api/v1')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
