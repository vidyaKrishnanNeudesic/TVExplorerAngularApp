import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ShowSearchComponent } from './show-search.component';
import { ShowSearchClient, Show } from '@tv-explorer/features/shows/data-access/show-search.client';

describe('ShowSearchComponent', () => {
  let component: ShowSearchComponent;
  let fixture: ComponentFixture<ShowSearchComponent>;
  let showSearchClient: jasmine.SpyObj<ShowSearchClient>;
  let httpMock: HttpTestingController;

  const mockShows: Show[] = [
    {
      id: 1,
      title: 'Game of Thrones',
      image: 'https://example.com/got.jpg',
      genres: ['Drama', 'Fantasy'],
      rating: 9.0
    },
    {
      id: 2,
      title: 'Breaking Bad',
      image: 'https://example.com/bb.jpg',
      genres: ['Drama', 'Crime'],
      rating: 9.5
    }
  ];

  beforeEach(async () => {
    const showSearchClientSpy = jasmine.createSpyObj('ShowSearchClient', ['searchShows']);

    await TestBed.configureTestingModule({
      imports: [ShowSearchComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ShowSearchClient, useValue: showSearchClientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowSearchComponent);
    component = fixture.componentInstance;
    showSearchClient = TestBed.inject(ShowSearchClient) as jasmine.SpyObj<ShowSearchClient>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty state', () => {
    const state = component.state();
    expect(state.shows).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.hasSearched).toBe(false);
  });

  it('should display search form', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#search-input');
    const searchButton = fixture.nativeElement.querySelector('.search-button');

    expect(searchInput).toBeTruthy();
    expect(searchButton).toBeTruthy();
    expect(searchInput.placeholder).toBe('Search for TV shows...');
  });

  it('should validate search input', () => {
    fixture.detectChanges();

    // Empty input should be invalid
    expect(component.searchControl.invalid).toBe(true);

    // Single character should be invalid
    component.searchControl.setValue('a');
    expect(component.searchControl.invalid).toBe(true);

    // Two or more characters should be valid
    component.searchControl.setValue('ab');
    expect(component.searchControl.valid).toBe(true);
  });

  it('should show validation error when touched and invalid', () => {
    fixture.detectChanges();

    component.searchControl.setValue('a');
    component.searchControl.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent.trim()).toBe('Query must be at least 2 characters long');
  });

  it('should perform search on form submit', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(of(mockShows));
    fixture.detectChanges();

    component.searchControl.setValue('game of thrones');
    component.onSearch();
    tick();

    expect(showSearchClient.searchShows).toHaveBeenCalledWith('game of thrones');
    expect(component.state().shows).toEqual(mockShows);
    expect(component.state().loading).toBe(false);
    expect(component.state().hasSearched).toBe(true);
  }));

  it('should auto-search with debouncing on input changes', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(of(mockShows));
    fixture.detectChanges();

    component.searchControl.setValue('go');
    tick(100); // Less than debounce time
    expect(showSearchClient.searchShows).not.toHaveBeenCalled();

    tick(300); // Meet debounce time
    expect(showSearchClient.searchShows).toHaveBeenCalledWith('go');
  }));

  it('should display loading state during search', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(of(mockShows));
    fixture.detectChanges();

    component.searchControl.setValue('test');
    component.onSearch();
    
    // Check loading state before tick
    expect(component.state().loading).toBe(true);
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();

    tick();
    fixture.detectChanges();

    expect(component.state().loading).toBe(false);
  }));

  it('should display search results', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(of(mockShows));
    fixture.detectChanges();

    component.searchControl.setValue('test');
    component.onSearch();
    tick();
    fixture.detectChanges();

    const showCards = fixture.nativeElement.querySelectorAll('ui-show-card');
    expect(showCards.length).toBe(2);

    const resultsGrid = fixture.nativeElement.querySelector('.results-grid');
    expect(resultsGrid.getAttribute('aria-label')).toBe('2 shows found');
  }));

  it('should display no results message when search returns empty array', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(of([]));
    fixture.detectChanges();

    component.searchControl.setValue('nonexistent');
    component.onSearch();
    tick();
    fixture.detectChanges();

    const noResultsElement = fixture.nativeElement.querySelector('.no-results-state');
    expect(noResultsElement).toBeTruthy();
    expect(noResultsElement.textContent).toContain('No shows found');
  }));

  it('should handle search errors', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();

    component.searchControl.setValue('test');
    component.onSearch();
    tick();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.error-state');
    expect(errorElement).toBeTruthy();
    expect(component.state().error).toBe('Failed to search shows. Please check your connection and try again.');
  }));

  it('should allow retry after error', fakeAsync(() => {
    // First search fails
    showSearchClient.searchShows.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();

    component.searchControl.setValue('test');
    component.onSearch();
    tick();
    fixture.detectChanges();

    // Retry should work
    showSearchClient.searchShows.and.returnValue(of(mockShows));
    const retryButton = fixture.nativeElement.querySelector('.retry-button');
    retryButton.click();
    tick();
    fixture.detectChanges();

    expect(component.state().shows).toEqual(mockShows);
    expect(component.state().error).toBe(null);
  }));

  it('should disable search button during loading', fakeAsync(() => {
    showSearchClient.searchShows.and.returnValue(of(mockShows));
    fixture.detectChanges();

    component.searchControl.setValue('test');
    component.onSearch();
    fixture.detectChanges();

    const searchButton = fixture.nativeElement.querySelector('.search-button');
    expect(searchButton.disabled).toBe(true);

    tick();
    fixture.detectChanges();

    expect(searchButton.disabled).toBe(false);
  }));

  it('should have proper accessibility attributes', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#search-input');
    const searchButton = fixture.nativeElement.querySelector('.search-button');

    expect(searchInput.getAttribute('aria-describedby')).toBe(null);
    expect(searchButton.getAttribute('aria-label')).toBe('Search for TV shows');

    // Test with validation error
    component.searchControl.setValue('a');
    component.searchControl.markAsTouched();
    fixture.detectChanges();

    expect(searchInput.getAttribute('aria-describedby')).toBe('search-error');
    
    const errorMessage = fixture.nativeElement.querySelector('#search-error');
    expect(errorMessage.getAttribute('role')).toBe('alert');
  });

  it('should focus search input on component init', fakeAsync(() => {
    spyOn(document, 'getElementById').and.returnValue(document.createElement('input'));
    const mockInput = document.getElementById('search-input') as HTMLInputElement;
    spyOn(mockInput, 'focus');

    component.ngOnInit();
    tick(100);

    expect(mockInput.focus).toHaveBeenCalled();
  }));
});