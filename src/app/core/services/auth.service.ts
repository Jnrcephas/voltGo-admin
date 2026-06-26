import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AdminLoginData,
  AdminLoginRequest,
  AdminProfile,
  ApiSimpleSuccess,
  ApiSuccessEnvelope,
  ChangePasswordRequest,
} from '../models';
import { AppConfigService } from './app-config.service';
import { AuthStore } from '../state/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly authStore = inject(AuthStore);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * Authenticates an admin and persists the resulting session.
   * Throws `ApiError` (via the error interceptor) on invalid credentials
   * (401) or an inactive account (403).
   */
  login(payload: AdminLoginRequest): Observable<AdminLoginData> {
    return this.http
      .post<ApiSuccessEnvelope<AdminLoginData>>(`${this.baseUrl}${API_ENDPOINTS.adminAuth.login}`, payload)
      .pipe(
        map((res) => res.data),
        tap((data) => this.authStore.setSession(data.token, data.admin)),
      );
  }

  /** Refreshes the cached admin profile from the server (e.g. after editing it elsewhere). */
  fetchCurrentAdmin(): Observable<AdminProfile> {
    return this.http
      .get<ApiSuccessEnvelope<AdminProfile>>(`${this.baseUrl}${API_ENDPOINTS.adminAuth.me}`)
      .pipe(
        map((res) => res.data),
        tap((admin) => this.authStore.updateAdminProfile(admin)),
      );
  }

  logout(): Observable<ApiSimpleSuccess> {
    return this.http
      .post<ApiSimpleSuccess>(`${this.baseUrl}${API_ENDPOINTS.adminAuth.logout}`, {})
      .pipe(tap(() => this.authStore.clearSession()));
  }

  /** Clears the local session immediately without waiting on the network call. */
  logoutLocally(): void {
    this.authStore.clearSession();
  }

  changePassword(payload: ChangePasswordRequest): Observable<ApiSimpleSuccess> {
    return this.http.post<ApiSimpleSuccess>(
      `${this.baseUrl}${API_ENDPOINTS.adminAuth.changePassword}`,
      payload,
    );
  }
}
