import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsStore } from '../../core/state/permissions.store';
import { ApiError } from '../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly permissionsStore = inject(PermissionsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly sessionExpired = this.route.snapshot.queryParamMap.get('sessionExpired') === '1';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  get emailInvalid(): boolean {
    const ctrl = this.form.controls.email;
    return ctrl.invalid && ctrl.touched;
  }

  get passwordInvalid(): boolean {
    const ctrl = this.form.controls.password;
    return ctrl.invalid && ctrl.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (data) => {
        // Resolve full permission set for the admin's role before landing
        // on the dashboard, so permission-gated UI renders correctly on
        // first paint rather than flashing then hiding.
        this.permissionsStore.loadForCurrentAdmin().subscribe({
          complete: () => {
            this.submitting.set(false);
            if (data.admin.reset_required) {
              this.router.navigate(['/change-password'], { queryParams: { forced: '1' } });
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
        });
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.',
        );
      },
    });
  }
}
