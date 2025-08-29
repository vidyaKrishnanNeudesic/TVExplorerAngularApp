import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@tv-explorer/features/shows/feature/search/show-search.component').then(m => m.ShowSearchComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('@tv-explorer/features/shows/feature/search/show-search.component').then(m => m.ShowSearchComponent)
  },
  {
    path: 'show/:id',
    loadComponent: () => import('@tv-explorer/features/shows/feature/detail/show-detail.component').then(m => m.ShowDetailComponent)
  },
  {
    path: 'demo',
    loadComponent: () => import('@tv-explorer/shared/ui/demo-show-grid/demo-show-grid.component').then(m => m.DemoShowGridComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
