import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  GoogleLoginRequest,
  UserProfile,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_BASE = 'https://quantitymeasurementapp-3-irmt.onrender.com/api';
  private readonly TOKEN_KEY = 'qm_jwt_token';
  private readonly USER_KEY  = 'qm_user_profile';

  // Reactive auth state
  private _isLoggedIn = signal<boolean>(this.hasValidToken());
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private _currentUser = signal<UserProfile | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();

  constructor(private http: HttpClient) {}

  /* ---- Registration ---- */
  register(payload: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_BASE}/auth/register`, payload, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  /* ---- Login ---- */
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/login`, payload).pipe(
      tap(res => this.handleAuth(res)),
      catchError(this.handleError)
    );
  }

  /* ---- Google Login ---- */
  googleLogin(idToken: string): Observable<AuthResponse> {
    const payload: GoogleLoginRequest = { idToken };
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/google-login`, payload).pipe(
      tap(res => this.handleAuth(res)),
      catchError(this.handleError)
    );
  }

  /* ---- Logout ---- */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
  }

  /* ---- Token helpers ---- */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }

  /* ---- Private helpers ---- */
  private handleAuth(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const profile: UserProfile = {
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      fullName: `${res.firstName} ${res.lastName}`,
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
    this._isLoggedIn.set(true);
    this._currentUser.set(profile);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): UserProfile | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private handleError(err: any): Observable<never> {
    let message = 'An unexpected error occurred';

    if (typeof err?.error === 'string') {
      message = err.error;
    } else if (err?.error) {
      message = err.error.message || err.error.title || message;
      
      // Parse ASP.NET Core Validation Problem Details
      if (err.error.errors) {
        const errorMessages = Object.values(err.error.errors)
          .flat()
          .join(' ');
        if (errorMessages) {
          message = `${message} ${errorMessages}`;
        }
      }
    }
    
    return throwError(() => new Error(message));
  }
}
