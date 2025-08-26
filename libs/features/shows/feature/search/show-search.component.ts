import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { ShowSearchClient, Show } from '@tv-explorer/features/shows/data-access/show-search.client';
import { ShowCardComponent } from '@tv-explorer/shared/ui/show-card/show-card.component';

export interface SearchState {
  shows: Show[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}

@Component({
  selector: 'app-show-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShowCardComponent],
  template: `
    <div class="search-container">
      <header class="search-header">
        <h1>TV Show Explorer</h1>
        <p>Discover your next favorite TV show</p>
      </header>

      <div class="search-form">
        <form (ngSubmit)="onSearch()" novalidate>
          <div class="search-input-group">
            <label for="search-input" class="sr-only">Search for TV shows</label>
            <input
              id="search-input"
              type="text"
              [formControl]="searchControl"
              placeholder="Search for TV shows..."
              class="search-input"
              [class.error]="searchControl.invalid && searchControl.touched"
              [attr.aria-describedby]="searchControl.invalid && searchControl.touched ? 'search-error' : null"
              autocomplete="off"
            />
            <button
              type="submit"
              class="search-button"
              [disabled]="searchControl.invalid || state().loading"
              [attr.aria-label]="state().loading ? 'Searching...' : 'Search for TV shows'"
            >
              @if (state().loading) {
                <span class="loading-spinner" aria-hidden="true"></span>
                <span class="sr-only">Searching...</span>
              } @else {
                <span aria-hidden="true">🔍</span>
                <span class="sr-only">Search</span>
              }
            </button>
          </div>
          
          @if (searchControl.invalid && searchControl.touched) {
            <div id="search-error" class="error-message" role="alert">
              Query must be at least 2 characters long
            </div>
          }
        </form>
      </div>

      <main class="search-results" [attr.aria-live]="state().loading ? 'polite' : 'off'">
        @if (state().loading) {
          <div class="loading-state" role="status" aria-label="Loading search results">
            <div class="loading-spinner large" aria-hidden="true"></div>
            <p>Searching for shows...</p>
          </div>
        } @else if (state().error) {
          <div class="error-state" role="alert">
            <h2>Unable to load shows</h2>
            <p>{{ state().error }}</p>
            <button 
              type="button" 
              class="retry-button"
              (click)="retrySearch()"
              [attr.aria-label]="'Retry search for: ' + searchControl.value"
            >
              Try Again
            </button>
          </div>
        } @else if (state().hasSearched && state().shows.length === 0) {
          <div class="no-results-state" role="status">
            <h2>No shows found</h2>
            <p>Try searching with different keywords</p>
          </div>
        } @else if (state().shows.length > 0) {
          <div class="results-grid" [attr.aria-label]="resultsAriaLabel()">
            @for (show of state().shows; track show.id) {
              <ui-show-card [show]="show" />
            }
          </div>
        }
      </main>
    </div>
  `,
  styleUrls: ['./show-search.component.scss']
})
export class ShowSearchComponent implements OnInit {
  private readonly showSearchClient = inject(ShowSearchClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly searchControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(2)],
    nonNullable: true
  });

  readonly state = signal<SearchState>({
    shows: [],
    loading: false,
    error: null,
    hasSearched: false
  });

  readonly resultsAriaLabel = computed(() => {
    const count = this.state().shows.length;
    return count === 1 ? `1 show found` : `${count} shows found`;
  });

  constructor() {
    // Auto-search with debouncing on input changes
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => query.length >= 2),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.performSearch();
    });
  }

  ngOnInit() {
    // Focus the search input for better UX (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  onSearch() {
    if (this.searchControl.valid) {
      this.performSearch();
    } else {
      this.searchControl.markAsTouched();
    }
  }

  retrySearch() {
    if (this.searchControl.valid) {
      this.performSearch();
    }
  }

  private performSearch() {
    const query = this.searchControl.value.trim();
    
    if (!query || query.length < 2) {
      return;
    }

    this.state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.showSearchClient.searchShows(query).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    ).subscribe({
      next: (shows) => {
        this.state.update(state => ({
          ...state,
          shows,
          loading: false,
          hasSearched: true,
          error: null
        }));
      },
      error: (error) => {
        this.state.update(state => ({
          ...state,
          loading: false,
          error: 'Failed to search shows. Please check your connection and try again.',
          hasSearched: true
        }));
      }
    });
  }
}