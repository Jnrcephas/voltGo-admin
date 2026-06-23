import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AdminVehicle,
  AdminVehicleListData,
  AdminVehicleListParams,
  ApiSuccessEnvelope,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  UpdateVehicleStatusRequest,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(params: AdminVehicleListParams = {}): Observable<AdminVehicleListData> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.is_active !== undefined)
      httpParams = httpParams.set('is_active', String(params.is_active));

    return this.http
      .get<ApiSuccessEnvelope<AdminVehicleListData>>(
        `${this.baseUrl}${API_ENDPOINTS.adminVehicles.list}`,
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
            vehicles: data.vehicles ?? data.items ?? [],
          } as AdminVehicleListData;
        }),
      );
  }

  getById(id: string): Observable<AdminVehicle> {
    return this.http
      .get<
        ApiSuccessEnvelope<AdminVehicle>
      >(`${this.baseUrl}${API_ENDPOINTS.adminVehicles.detail(id)}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateVehicleRequest): Observable<AdminVehicle> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminVehicle>
      >(`${this.baseUrl}${API_ENDPOINTS.adminVehicles.create}`, payload)
      .pipe(map((res) => res.data));
  }

  update(id: string, payload: UpdateVehicleRequest): Observable<AdminVehicle> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminVehicle>
      >(`${this.baseUrl}${API_ENDPOINTS.adminVehicles.update(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  setStatus(id: string, payload: UpdateVehicleStatusRequest): Observable<AdminVehicle> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminVehicle>
      >(`${this.baseUrl}${API_ENDPOINTS.adminVehicles.setStatus(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  deactivate(id: string): Observable<AdminVehicle> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminVehicle>
      >(`${this.baseUrl}${API_ENDPOINTS.adminVehicles.deactivate(id)}`, {})
      .pipe(map((res) => res.data));
  }

  reactivate(id: string): Observable<AdminVehicle> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminVehicle>
      >(`${this.baseUrl}${API_ENDPOINTS.adminVehicles.reactivate(id)}`, {})
      .pipe(map((res) => res.data));
  }
}
