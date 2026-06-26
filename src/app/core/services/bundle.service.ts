import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AdminBundleListParams,
  AdminBundleProduct,
  ApiSuccessEnvelope,
  CreateBundleProductRequest,
  UpdateBundleProductRequest,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class BundleService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(params: AdminBundleListParams = {}): Observable<AdminBundleProduct[]> {
    let httpParams = new HttpParams();
    if (params.is_active !== undefined) httpParams = httpParams.set('is_active', String(params.is_active));

    return this.http
      .get<ApiSuccessEnvelope<AdminBundleProduct[]>>(`${this.baseUrl}${API_ENDPOINTS.adminBundles.list}`, {
        params: httpParams,
      })
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<AdminBundleProduct> {
    return this.http
      .get<ApiSuccessEnvelope<AdminBundleProduct>>(`${this.baseUrl}${API_ENDPOINTS.adminBundles.detail(id)}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateBundleProductRequest): Observable<AdminBundleProduct> {
    return this.http
      .post<ApiSuccessEnvelope<AdminBundleProduct>>(
        `${this.baseUrl}${API_ENDPOINTS.adminBundles.create}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  update(id: string, payload: UpdateBundleProductRequest): Observable<AdminBundleProduct> {
    return this.http
      .put<ApiSuccessEnvelope<AdminBundleProduct>>(
        `${this.baseUrl}${API_ENDPOINTS.adminBundles.update(id)}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  deprecate(id: string): Observable<AdminBundleProduct> {
    return this.http
      .post<ApiSuccessEnvelope<AdminBundleProduct>>(
        `${this.baseUrl}${API_ENDPOINTS.adminBundles.deprecate(id)}`,
        {},
      )
      .pipe(map((res) => res.data));
  }

  restore(id: string): Observable<AdminBundleProduct> {
    return this.http
      .post<ApiSuccessEnvelope<AdminBundleProduct>>(
        `${this.baseUrl}${API_ENDPOINTS.adminBundles.restore(id)}`,
        {},
      )
      .pipe(map((res) => res.data));
  }
}
