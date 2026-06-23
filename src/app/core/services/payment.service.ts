import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  ActivatePaymentRequest,
  AdminPaymentListData,
  AdminPaymentListParams,
  ApiSuccessEnvelope,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(params: AdminPaymentListParams = {}): Observable<AdminPaymentListData> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.type) httpParams = httpParams.set('type', params.type);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminPayments.list}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data;
          const rawItems = d.payments ?? d.items ?? [];
          return {
            total: d.total,
            page: d.page,
            pages: d.pages,
            payments: rawItems.map((p: any) => ({
              id: p.id,
              reference: p.paystack_ref ?? p.reference ?? '—',
              customer: p.customer,
              type: p.type,
              method: p.method ?? null,
              amount: parseFloat(p.amount_ghs ?? p.amount ?? '0'),
              status: p.status,
              created_at: p.created_at,
            })),
          } as AdminPaymentListData;
        }),
      );
  }

  activate(payload: ActivatePaymentRequest): Observable<unknown> {
    return this.http
      .post<
        ApiSuccessEnvelope<unknown>
      >(`${this.baseUrl}${API_ENDPOINTS.adminPayments.activate}`, payload)
      .pipe(map((res) => res.data));
  }
}
