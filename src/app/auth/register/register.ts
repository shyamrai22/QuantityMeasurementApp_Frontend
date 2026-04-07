import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl,
  ValidationErrors, ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass    = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8),
                           Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  isLoading = signal(false);
  errorMsg  = signal('');
  successMsg= signal('');
  showPass  = signal(false);

  get f() { return this.registerForm.controls; }

  togglePass(): void { this.showPass.update(v => !v); }

  getStrengthClass(pwd: string): string {
    const score = this.strengthScore(pwd);
    if (score <= 1) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  getStrengthLabel(pwd: string): string {
    const cls = this.getStrengthClass(pwd);
    return cls === 'weak' ? 'Weak' : cls === 'medium' ? 'Medium' : 'Strong';
  }

  private strengthScore(pwd: string): number {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMsg.set('');

    const payload = this.registerForm.value;

    this.auth.register(payload).subscribe({
      next: () => {
        this.successMsg.set('Account created successfully! Redirecting to login…');
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err) => {
        this.errorMsg.set(err.message);
        this.isLoading.set(false);
      },
    });
  }
}
