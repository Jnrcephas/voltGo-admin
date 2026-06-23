import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AdminOrder,
  AdminOrderListData,
  AdminOrderListParams,
  ApiSuccessEnvelope,
  AssignRiderToOrderRequest,
  CancelOrderRequest,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(params: AdminOrderListParams = {}): Observable<AdminOrderListData> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.vehicle_type) httpParams = httpParams.set('vehicle_type', params.vehicle_type);
    if (params.rider_id) httpParams = httpParams.set('rider_id', params.rider_id);
    if (params.customer_id) httpParams = httpParams.set('customer_id', params.customer_id);

    return this.http
      .get<ApiSuccessEnvelope<AdminOrderListData>>(
        `${this.baseUrl}${API_ENDPOINTS.adminOrders.list}`,
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
            orders: data.orders ?? data.items ?? [],
          } as AdminOrderListData;
        }),
      );
  }

  getById(id: string): Observable<AdminOrder> {
    return this.http
      .get<ApiSuccessEnvelope<AdminOrder>>(`${this.baseUrl}${API_ENDPOINTS.adminOrders.detail(id)}`)
      .pipe(map((res) => res.data));
  }

  assignRider(id: string, payload: AssignRiderToOrderRequest): Observable<AdminOrder> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminOrder>
      >(`${this.baseUrl}${API_ENDPOINTS.adminOrders.assignRider(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  reassignRider(id: string, payload: AssignRiderToOrderRequest): Observable<AdminOrder> {
    return this.http
      .put<
        ApiSuccessEnvelope<AdminOrder>
      >(`${this.baseUrl}${API_ENDPOINTS.adminOrders.reassignRider(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  cancel(id: string, payload: CancelOrderRequest): Observable<AdminOrder> {
    return this.http
      .post<
        ApiSuccessEnvelope<AdminOrder>
      >(`${this.baseUrl}${API_ENDPOINTS.adminOrders.cancel(id)}`, payload)
      .pipe(map((res) => res.data));
  }
}
