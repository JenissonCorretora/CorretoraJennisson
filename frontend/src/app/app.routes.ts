import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/home/home').then(m => m.Home)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./modules/sobre/sobre').then(m => m.Sobre)
  },
  {
    path: 'imoveis',
    loadComponent: () => import('./modules/imoveis/imoveis').then(m => m.Imoveis)
  },
  {
    path: 'imoveis/:id',
    loadComponent: () => import('./modules/imoveis/imovel-detalhe').then(m => m.ImovelDetalhe)
  },
  {
    path: 'contato',
    loadComponent: () => import('./modules/contato/contato').then(m => m.Contato)
  },
  {
    path: 'login',
    loadComponent: () => import('./layout/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./layout/register/register').then(m => m.Register)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./layout/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'terms',
    loadComponent: () => import('./layout/terms/terms').then(m => m.Terms)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./layout/privacy/privacy').then(m => m.Privacy)
  },
  {
    path: 'admin/register',
    loadComponent: () => import('./layout/admin-register/admin-register').then(m => m.AdminRegister)
  },
  {
    path: 'admin/imoveis',
    loadComponent: () => import('./modules/admin/imoveis/imoveis-admin').then(m => m.ImoveisAdmin),
    canActivate: [adminGuard]
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./modules/favoritos/favoritos').then(m => m.Favoritos),
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./modules/chat/chat/chat').then(m => m.Chat),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
