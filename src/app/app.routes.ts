import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
    title: 'Login — QuantifyPro',
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent),
    title: 'Create Account — QuantifyPro',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    title: 'Dashboard — QuantifyPro',
  },
  {
    path: 'records',
    canActivate: [authGuard],
    loadComponent: () => import('./records/records').then(m => m.RecordsComponent),
    title: 'Records — QuantifyPro',
  },

  // Wildcard — redirect to dashboard (guard handles auth)
  { path: '**', redirectTo: '/dashboard' },
];
