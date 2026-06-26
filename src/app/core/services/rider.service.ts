import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AdminRider,
  AdminRiderListData,
  AdminRiderListParams,
  ApiSimpleSuccess,
  ApiSuccessEnvelope,
  AssignVehicleRequest,
  RejectRiderRequest,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class RiderService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(params: AdminRiderListParams = {}): Observable<AdminRiderListData> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.kyc_status) httpParams = httpParams.set('kyc_status', params.kyc_status);
    if (params.is_active !== undefined)
      httpParams = httpParams.set('is_active', String(params.is_active));
    if (params.active_status) httpParams = httpParams.set('active_status', params.active_status);

    return this.http
      .get<ApiSuccessEnvelope<AdminRiderListData>>(
        `${this.baseUrl}${API_ENDPOINTS.adminRiders.list}`,
        {
          params: httpParams,
        },
      )
      .pipe(
        map((res) => {
          const data = res.data as any;
          return {
            total: data.total,
            page: data.page,
            pages: data.pages,
            riders: data.riders ?? data.items ?? [],
          } as AdminRiderListData;
        }),
      );
  }

  getById(id: string): Observable<AdminRider> {
    return this.http
      .get<ApiSuccessEnvelope<AdminRider>>(`${this.baseUrl}${API_ENDPOINTS.adminRiders.detail(id)}`)
      .pipe(map((res) => res.data));
  }

  approve(id: string): Observable<AdminRider> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.approve(id)}`, {})
      .pipe(map((res) => res.data));
  }

  reject(id: string, payload: RejectRiderRequest): Observable<AdminRider> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.reject(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  activate(id: string): Observable<AdminRider> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.activate(id)}`, {})
      .pipe(map((res) => res.data));
  }

  suspend(id: string): Observable<AdminRider> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.suspend(id)}`, {})
      .pipe(map((res) => res.data));
  }

  deactivate(id: string): Observable<AdminRider> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.deactivate(id)}`, {})
      .pipe(map((res) => res.data));
  }

  assignVehicle(id: string, payload: AssignVehicleRequest): Observable<AdminRider> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.assignVehicle(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  unassignVehicle(id: string): Observable<AdminRider> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.unassignVehicle(id)}`, {})
      .pipe(map((res) => res.data));
  }

  resetStatus(id: string): Observable<AdminRider> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminRider>
      >(`${this.baseUrl}${API_ENDPOINTS.adminRiders.resetStatus(id)}`, {})
      .pipe(map((res) => res.data));
  }
}
