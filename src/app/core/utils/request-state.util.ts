import { computed, signal } from '@angular/core';

export interface RequestState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * Small helper to avoid re-writing `loading`/`error`/`data` signal triplets
 * in every feature component. Usage:
 *
 * ```ts
 * riders = createRequestState<AdminRider[]>([]);
 *
 * load() {
 *   this.riders.start();
 *   this.riderService.list().subscribe({
 *     next: (data) => this.riders.succeed(data.riders),
 *     error: (err) => this.riders.fail(err.message),
 *   });
 * }
 * ```
 */
export function createRequestState<T>(initial: T) {
  const data = signal<T>(initial);
  const loading = signal(false);
  const error = signal<string | null>(null);

  return {
    data,
    loading,
    error,
    isEmpty: computed(() => !loading() && !error()),
    start: () => {
      loading.set(true);
      error.set(null);
    },
    succeed: (value: T) => {
      data.set(value);
      loading.set(false);
      error.set(null);
    },
    fail: (message: string) => {
      loading.set(false);
      error.set(message || 'Something went wrong. Please try again.');
    },
  };
}
