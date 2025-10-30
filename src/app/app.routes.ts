import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'application-flow',
    pathMatch: 'full'
  },
  {
    path: 'application-flow',
    loadComponent: () => import('./features/application-flow/application-flow').then(m => m.ApplicationFlow)
  }
];
