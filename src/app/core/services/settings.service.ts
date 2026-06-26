import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  ApiSuccessEnvelope,
  SettingKey,
  SystemSetting,
  UpdateSettingRequest,
  UpdateSettingResponseData,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  list(): Observable<SystemSetting[]> {
    return this.http
      .get<ApiSuccessEnvelope<SystemSetting[]>>(`${this.baseUrl}${API_ENDPOINTS.adminSettings.list}`)
      .pipe(map((res) => res.data));
  }

  update(key: SettingKey, payload: UpdateSettingRequest): Observable<UpdateSettingResponseData> {
    return this.http
      .put<ApiSuccessEnvelope<UpdateSettingResponseData>>(
        `${this.baseUrl}${API_ENDPOINTS.adminSettings.update(key)}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }
}
