import { Routes } from '@angular/router';

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
    path: 'contato',
    loadComponent: () => import('./modules/contato/contato').then(m => m.Contato)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
