import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowDetailCardComponent } from './show-detail-card.component';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';

describe('ShowDetailCardComponent', () => {
  let component: ShowDetailCardComponent;
  let fixture: ComponentFixture<ShowDetailCardComponent>;

  const mockShow: Show = {
    id: 1,
    title: 'Test Show',
    genres: ['Drama', 'Comedy'],
    image: 'https://example.com/image.jpg',
    rating: 8.5,
    summary: '<p>Test summary with <strong>HTML</strong> content</p>',
    schedule: {
      time: '20:00',
      days: ['Monday', 'Tuesday']
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowDetailCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowDetailCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('show', mockShow);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display show title', () => {
    const titleElement = fixture.nativeElement.querySelector('.show-detail-card__title');
    expect(titleElement.textContent.trim()).toBe('Test Show');
  });

  it('should display show image', () => {
    const imageElement = fixture.nativeElement.querySelector('.show-detail-card__image');
    expect(imageElement).toBeTruthy();
    expect(imageElement.src).toBe('https://example.com/image.jpg');
    expect(imageElement.alt).toBe('Test Show');
  });

  it('should display placeholder when no image available', () => {
    fixture.componentRef.setInput('show', { ...mockShow, image: undefined });
    fixture.detectChanges();

    const placeholderElement = fixture.nativeElement.querySelector('.show-detail-card__placeholder');
    expect(placeholderElement).toBeTruthy();
    expect(placeholderElement.textContent).toContain('No Image Available');
  });

  it('should display rating', () => {
    const ratingElement = fixture.nativeElement.querySelector('.show-detail-card__rating-value');
    expect(ratingElement.textContent.trim()).toContain('8.5');
    
    const ratingText = fixture.nativeElement.querySelector('.show-detail-card__rating-text');
    expect(ratingText.textContent.trim()).toBe('out of 10');
  });

  it('should not display rating when not available', () => {
    fixture.componentRef.setInput('show', { ...mockShow, rating: undefined });
    fixture.detectChanges();

    const ratingElement = fixture.nativeElement.querySelector('.show-detail-card__rating');
    expect(ratingElement).toBeFalsy();
  });

  it('should display genres', () => {
    const genresElement = fixture.nativeElement.querySelector('.show-detail-card__genres-text');
    expect(genresElement.textContent.trim()).toBe('Drama, Comedy');
  });

  it('should not display genres when empty', () => {
    fixture.componentRef.setInput('show', { ...mockShow, genres: [] });
    fixture.detectChanges();

    const genresElement = fixture.nativeElement.querySelector('.show-detail-card__genres');
    expect(genresElement).toBeFalsy();
  });

  it('should display schedule', () => {
    const scheduleElement = fixture.nativeElement.querySelector('.show-detail-card__schedule-text');
    expect(scheduleElement.textContent.trim()).toBe('Monday, Tuesday at 20:00');
  });

  it('should display schedule with only days', () => {
    fixture.componentRef.setInput('show', { 
      ...mockShow, 
      schedule: { days: ['Monday', 'Tuesday'], time: undefined } 
    });
    fixture.detectChanges();

    const scheduleElement = fixture.nativeElement.querySelector('.show-detail-card__schedule-text');
    expect(scheduleElement.textContent.trim()).toBe('Monday, Tuesday');
  });

  it('should display schedule with only time', () => {
    fixture.componentRef.setInput('show', { 
      ...mockShow, 
      schedule: { time: '20:00', days: [] } 
    });
    fixture.detectChanges();

    const scheduleElement = fixture.nativeElement.querySelector('.show-detail-card__schedule-text');
    expect(scheduleElement.textContent.trim()).toBe('at 20:00');
  });

  it('should not display schedule when not available', () => {
    fixture.componentRef.setInput('show', { ...mockShow, schedule: undefined });
    fixture.detectChanges();

    const scheduleElement = fixture.nativeElement.querySelector('.show-detail-card__schedule');
    expect(scheduleElement).toBeFalsy();
  });

  it('should display sanitized summary', () => {
    const summaryElement = fixture.nativeElement.querySelector('.show-detail-card__summary-content');
    expect(summaryElement).toBeTruthy();
    expect(summaryElement.innerHTML).toContain('Test summary');
    expect(summaryElement.innerHTML).toContain('<strong>HTML</strong>');
  });

  it('should not display summary when not available', () => {
    fixture.componentRef.setInput('show', { ...mockShow, summary: undefined });
    fixture.detectChanges();

    const summaryElement = fixture.nativeElement.querySelector('.show-detail-card__summary');
    expect(summaryElement).toBeFalsy();
  });

  it('should have proper aria labels', () => {
    const cardElement = fixture.nativeElement.querySelector('.show-detail-card');
    expect(cardElement.getAttribute('aria-label')).toBe('Test Show TV show details');

    const ratingElement = fixture.nativeElement.querySelector('.show-detail-card__rating');
    expect(ratingElement.getAttribute('aria-label')).toBe('Rating 8.5 out of 10');

    const genresElement = fixture.nativeElement.querySelector('.show-detail-card__genres');
    expect(genresElement.getAttribute('aria-label')).toBe('Genres: Drama, Comedy');

    const scheduleElement = fixture.nativeElement.querySelector('.show-detail-card__schedule');
    expect(scheduleElement.getAttribute('aria-label')).toBe('Schedule: Monday, Tuesday at 20:00');
  });

  it('should compute correct display values', () => {
    expect(component.ariaLabel()).toBe('Test Show TV show details');
    expect(component.ratingAriaLabel()).toBe('Rating 8.5 out of 10');
    expect(component.genresDisplay()).toBe('Drama, Comedy');
    expect(component.scheduleDisplay()).toBe('Monday, Tuesday at 20:00');
  });

  it('should handle empty values in computed properties', () => {
    const emptyShow = {
      id: 1,
      title: 'Empty Show',
      genres: [],
      image: undefined,
      rating: undefined,
      summary: undefined,
      schedule: undefined
    };
    
    fixture.componentRef.setInput('show', emptyShow);
    fixture.detectChanges();

    expect(component.genresDisplay()).toBe(null);
    expect(component.scheduleDisplay()).toBe(null);
    expect(component.sanitizedSummary()).toBe(null);
  });
});