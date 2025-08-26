import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowCardComponent } from './show-card.component';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';

describe('ShowCardComponent', () => {
  let component: ShowCardComponent;
  let fixture: ComponentFixture<ShowCardComponent>;

  const mockShow: Show = {
    id: 1,
    title: 'Game of Thrones',
    image: 'https://example.com/image.jpg',
    genres: ['Drama', 'Adventure', 'Fantasy'],
    rating: 9.0,
    summary: 'A fantasy drama series'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('show', mockShow);
    expect(component).toBeTruthy();
  });

  it('should display show title', () => {
    fixture.componentRef.setInput('show', mockShow);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('.show-card__title');
    expect(titleElement.textContent.trim()).toBe('Game of Thrones');
  });

  it('should display show image when available', () => {
    fixture.componentRef.setInput('show', mockShow);
    fixture.detectChanges();

    const imageElement = fixture.nativeElement.querySelector('.show-card__image');
    expect(imageElement).toBeTruthy();
    expect(imageElement.src).toBe('https://example.com/image.jpg');
    expect(imageElement.alt).toBe('Game of Thrones');
  });

  it('should display placeholder when image is not available', () => {
    const showWithoutImage: Show = { ...mockShow, image: undefined };
    fixture.componentRef.setInput('show', showWithoutImage);
    fixture.detectChanges();

    const placeholderElement = fixture.nativeElement.querySelector('.show-card__placeholder');
    const imageElement = fixture.nativeElement.querySelector('.show-card__image');
    
    expect(placeholderElement).toBeTruthy();
    expect(imageElement).toBeFalsy();
    expect(placeholderElement.getAttribute('aria-label')).toBe('No image available for Game of Thrones');
  });

  it('should display rating when available', () => {
    fixture.componentRef.setInput('show', mockShow);
    fixture.detectChanges();

    const ratingElement = fixture.nativeElement.querySelector('.show-card__rating-value');
    expect(ratingElement.textContent.trim()).toBe('★ 9');
    
    const ratingContainer = fixture.nativeElement.querySelector('.show-card__rating');
    expect(ratingContainer.getAttribute('aria-label')).toBe('Rating 9 out of 10');
  });

  it('should not display rating when not available', () => {
    const showWithoutRating: Show = { ...mockShow, rating: undefined };
    fixture.componentRef.setInput('show', showWithoutRating);
    fixture.detectChanges();

    const ratingElement = fixture.nativeElement.querySelector('.show-card__rating');
    expect(ratingElement).toBeFalsy();
  });

  it('should display genres when available', () => {
    fixture.componentRef.setInput('show', mockShow);
    fixture.detectChanges();

    const genresElement = fixture.nativeElement.querySelector('.show-card__genres-text');
    expect(genresElement.textContent.trim()).toBe('Drama, Adventure, Fantasy');
    
    const genresContainer = fixture.nativeElement.querySelector('.show-card__genres');
    expect(genresContainer.getAttribute('aria-label')).toBe('Genres: Drama, Adventure, Fantasy');
  });

  it('should not display genres when empty', () => {
    const showWithoutGenres: Show = { ...mockShow, genres: [] };
    fixture.componentRef.setInput('show', showWithoutGenres);
    fixture.detectChanges();

    const genresElement = fixture.nativeElement.querySelector('.show-card__genres');
    expect(genresElement).toBeFalsy();
  });

  it('should have proper accessibility attributes', () => {
    fixture.componentRef.setInput('show', mockShow);
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.querySelector('.show-card');
    expect(cardElement.getAttribute('role')).toBe('img');
    expect(cardElement.getAttribute('aria-label')).toBe('Game of Thrones TV show card');
  });

  it('should handle shows with minimal data', () => {
    const minimalShow: Show = {
      id: 2,
      title: 'Minimal Show',
      genres: []
    };
    
    fixture.componentRef.setInput('show', minimalShow);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('.show-card__title');
    const placeholderElement = fixture.nativeElement.querySelector('.show-card__placeholder');
    const ratingElement = fixture.nativeElement.querySelector('.show-card__rating');
    const genresElement = fixture.nativeElement.querySelector('.show-card__genres');

    expect(titleElement.textContent.trim()).toBe('Minimal Show');
    expect(placeholderElement).toBeTruthy();
    expect(ratingElement).toBeFalsy();
    expect(genresElement).toBeFalsy();
  });
});