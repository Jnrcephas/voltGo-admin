import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AdminUserListData,
  AdminUserListItem,
  ApiSimpleSuccess,
  ApiSuccessEnvelope,
  CreateAdminUserRequest,
  PaginationParams,
  ResetAdminUserPasswordRequest,
  UpdateAdminUserRequest,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(params: PaginationParams = {}): Observable<AdminUserListData> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminUsers.list}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data;
          return {
            total: d.total,
            page: d.page,
            pages: d.pages,
            users: d.users ?? d.items ?? [],
          } as AdminUserListData;
        }),
      );
  }

  getById(id: string): Observable<AdminUserListItem> {
    return this.http
      .get<
        ApiSuccessEnvelope<AdminUserListItem>
      >(`${this.baseUrl}${API_ENDPOINTS.adminUsers.detail(id)}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateAdminUserRequest): Observable<AdminUserListItem> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminUserListItem>
      >(`${this.baseUrl}${API_ENDPOINTS.adminUsers.create}`, payload)
      .pipe(map((res) => res.data));
  }

  update(id: string, payload: UpdateAdminUserRequest): Observable<AdminUserListItem> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminUserListItem>
      >(`${this.baseUrl}${API_ENDPOINTS.adminUsers.update(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  deactivate(id: string): Observable<ApiSimpleSuccess> {
    return this.http.post<ApiSimpleSuccess>(
      `${this.baseUrl}${API_ENDPOINTS.adminUsers.deactivate(id)}`,
      {},
    );
  }

  resetPassword(id: string, payload: ResetAdminUserPasswordRequest): Observable<ApiSimpleSuccess> {
    return this.http.post<ApiSimpleSuccess>(
      `${this.baseUrl}${API_ENDPOINTS.adminUsers.resetPassword(id)}`,
      payload,
    );
  }
}
