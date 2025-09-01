import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShowDetailClient } from '@tv-explorer/features/shows/data-access/show-detail.client';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';
import { ShowDetailCardComponent } from '@tv-explorer/shared/ui/show-detail-card/show-detail-card.component';

export interface ShowDetailState {
  show: Show | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-show-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ShowDetailCardComponent],
  template: `
    <div class="show-detail-container">
      <!-- Back Navigation -->
      <nav class="breadcrumb" role="navigation" aria-label="Breadcrumb">
        <a routerLink="/" class="back-link" [attr.aria-label]="'Back to search results'">
          <span aria-hidden="true">←</span>
          <span>Back to Search</span>
        </a>
      </nav>

      <main class="detail-content">
        @if (state().loading) {
          <div class="loading-state" role="status" aria-live="polite">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p>Loading show details...</p>
          </div>
        } @else if (state().error) {
          <div class="error-state" role="alert">
            <h1>Show Not Found</h1>
            <p>{{ state().error }}</p>
            <button 
              type="button" 
              class="retry-button"
              (click)="retry()"
              aria-label="Retry loading show details"
            >
              Try Again
            </button>
          </div>
        } @else if (state().show) {
          <ui-show-detail-card [show]="state().show!" />
        }
      </main>
    </div>
  `,
  styleUrls: ['./show-detail.component.scss']
})
export class ShowDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly showDetailClient = inject(ShowDetailClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly showId = signal<number | null>(null);

  readonly state = signal<ShowDetailState>({
    show: null,
    loading: false,
    error: null
  });

  readonly pageTitle = computed(() => {
    const show = this.state().show;
    return show ? `${show.title} - TV Explorer` : 'Show Details - TV Explorer';
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = params.get('id');
        if (id && !isNaN(Number(id))) {
          this.showId.set(Number(id));
          this.loadShowDetails(Number(id));
        } else {
          this.state.update(state => ({
            ...state,
            error: 'Invalid show ID',
            loading: false
          }));
        }
      });
  }

  retry(): void {
    const id = this.showId();
    if (id) {
      this.loadShowDetails(id);
    }
  }

  private loadShowDetails(id: number): void {
    this.state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.showDetailClient.getShowDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (show) => {
          this.state.update(state => ({
            ...state,
            show,
            loading: false,
            error: null
          }));
        },
        error: (error) => {
          console.error('Failed to load show details:', error);
          this.state.update(state => ({
            ...state,
            loading: false,
            error: error.status === 404 
              ? 'The requested show was not found.' 
              : 'Failed to load show details. Please check your connection and try again.',
            show: null
          }));
        }
      });
  }
}