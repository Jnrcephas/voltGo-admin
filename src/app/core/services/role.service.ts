import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  ApiSimpleSuccess,
  ApiSuccessEnvelope,
  CreateRoleRequest,
  Permission,
  PermissionsListData,
  Role,
  RolesListData,
  SetRolePermissionsRequest,
  UpdateRoleRequest,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  listPermissions(): Observable<Permission[]> {
    return this.http.get<any>(`${this.baseUrl}${API_ENDPOINTS.adminRoles.permissions}`).pipe(
      map((res) => {
        const d = res.data;
        // API returns data as a plain array
        return Array.isArray(d) ? d : (d.permissions ?? d.items ?? []);
      }),
    );
  }

  listRoles(includePermissions = true): Observable<Role[]> {
    const params = new HttpParams().set('include_permissions', String(includePermissions));
    return this.http.get<any>(`${this.baseUrl}${API_ENDPOINTS.adminRoles.list}`, { params }).pipe(
      map((res) => {
        const d = res.data;
        return Array.isArray(d) ? d : (d.roles ?? d.items ?? []);
      }),
    );
  }

  getRole(id: string, includePermissions = true): Observable<Role> {
    const params = new HttpParams().set('include_permissions', String(includePermissions));
    return this.http
      .get<
        ApiSuccessEnvelope<Role>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRoles.detail(id)}`, { params })
      .pipe(map((res) => res.data));
  }

  createRole(payload: CreateRoleRequest): Observable<Role> {
    return this.http
      .post<ApiSuccessEnvelope<Role>>(`${this.baseUrl}${API_ENDPOINTS.adminRoles.create}`, payload)
      .pipe(map((res) => res.data));
  }

  updateRole(id: string, payload: UpdateRoleRequest): Observable<Role> {
    return this.http
      .put<
        ApiSuccessEnvelope<Role>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRoles.update(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteRole(id: string): Observable<ApiSimpleSuccess> {
    return this.http.delete<ApiSimpleSuccess>(
      `${this.baseUrl}${API_ENDPOINTS.adminRoles.delete(id)}`,
    );
  }

  setRolePermissions(id: string, payload: SetRolePermissionsRequest): Observable<Role> {
    return this.http
      .put<
        ApiSuccessEnvelope<Role>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRoles.setPermissions(id)}`, payload)
      .pipe(map((res) => res.data));
  }
}
