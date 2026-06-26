import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/state/auth.store';
import { ApiError } from '../../core/interceptors/error.interceptor';

function passwordsMatchValidator(group: import('@angular/forms').AbstractControl): ValidationErrors | null {
  const newPassword = group.get('new_password')?.value;
  const confirm = group.get('confirm_password')?.value;
  return newPassword && confirm && newPassword !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly success = signal(false);
  readonly isForced = this.route.snapshot.queryParamMap.get('forced') === '1';
  readonly adminName = this.authStore.admin()?.full_name ?? 'Admin';

  form = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  get mismatch(): boolean {
    return this.form.hasError('mismatch') && this.form.controls.confirm_password.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { current_password, new_password } = this.form.getRawValue();

    this.authService.changePassword({ current_password, new_password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/dashboard']), 1400);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err instanceof ApiError ? err.message : 'Unable to change password. Please try again.',
        );
      },
    });
  }

  skipForNow(): void {
    this.router.navigate(['/dashboard']);
  }
}
