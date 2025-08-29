import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ShowDetailComponent } from './show-detail.component';
import { ShowDetailClient } from '@tv-explorer/features/shows/data-access/show-detail.client';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';

// Helper to create ParamMap mock
const createParamMap = (params: { [key: string]: string | null }): ParamMap => ({
  get: (key: string) => params[key] || null,
  has: (key: string) => key in params,
  getAll: (key: string) => params[key] ? [params[key] as string] : [],
  keys: Object.keys(params)
});

describe('ShowDetailComponent', () => {
  let component: ShowDetailComponent;
  let fixture: ComponentFixture<ShowDetailComponent>;
  let showDetailClient: jasmine.SpyObj<ShowDetailClient>;

  const mockShow: Show = {
    id: 1,
    title: 'Test Show',
    genres: ['Drama', 'Comedy'],
    image: 'https://example.com/image.jpg',
    rating: 8.5,
    summary: '<p>Test summary</p>',
    schedule: {
      time: '20:00',
      days: ['Monday', 'Tuesday']
    }
  };

  beforeEach(async () => {
    const showDetailClientSpy = jasmine.createSpyObj('ShowDetailClient', ['getShowDetails']);

    await TestBed.configureTestingModule({
      imports: [ShowDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ShowDetailClient, useValue: showDetailClientSpy },
        { 
          provide: ActivatedRoute, 
          useValue: { 
            paramMap: of(createParamMap({ id: '1' }))
          } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowDetailComponent);
    component = fixture.componentInstance;
    showDetailClient = TestBed.inject(ShowDetailClient) as jasmine.SpyObj<ShowDetailClient>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load show details on init with valid ID', fakeAsync(() => {
    showDetailClient.getShowDetails.and.returnValue(of(mockShow));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(showDetailClient.getShowDetails).toHaveBeenCalledWith(1);
    expect(component.state().show).toEqual(mockShow);
    expect(component.state().loading).toBe(false);
    expect(component.state().error).toBe(null);
  }));

  it('should show loading state initially', fakeAsync(() => {
    showDetailClient.getShowDetails.and.returnValue(of(mockShow));
    
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.state().loading).toBe(true);
    
    tick();
    fixture.detectChanges();
    
    expect(component.state().loading).toBe(false);
  }));

  it('should handle invalid ID', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ShowDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ShowDetailClient, useValue: showDetailClient },
        { 
          provide: ActivatedRoute, 
          useValue: { 
            paramMap: of(createParamMap({ id: 'invalid' }))
          } 
        }
      ]
    });
    
    fixture = TestBed.createComponent(ShowDetailComponent);
    component = fixture.componentInstance;
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.state().error).toBe('Invalid show ID');
    expect(component.state().loading).toBe(false);
    expect(showDetailClient.getShowDetails).not.toHaveBeenCalled();
  }));

  it('should handle missing ID', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ShowDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ShowDetailClient, useValue: showDetailClient },
        { 
          provide: ActivatedRoute, 
          useValue: { 
            paramMap: of(createParamMap({}))
          } 
        }
      ]
    });
    
    fixture = TestBed.createComponent(ShowDetailComponent);
    component = fixture.componentInstance;
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.state().error).toBe('Invalid show ID');
    expect(component.state().loading).toBe(false);
    expect(showDetailClient.getShowDetails).not.toHaveBeenCalled();
  }));

  it('should handle API errors', fakeAsync(() => {
    const error = { status: 404, message: 'Not Found' };
    showDetailClient.getShowDetails.and.returnValue(throwError(() => error));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.state().error).toBe('The requested show was not found.');
    expect(component.state().loading).toBe(false);
    expect(component.state().show).toBe(null);
  }));

  it('should handle network errors', fakeAsync(() => {
    const error = { status: 500, message: 'Server Error' };
    showDetailClient.getShowDetails.and.returnValue(throwError(() => error));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.state().error).toBe('Failed to load show details. Please check your connection and try again.');
    expect(component.state().loading).toBe(false);
    expect(component.state().show).toBe(null);
  }));

  it('should retry loading on retry button click', fakeAsync(() => {
    // First call fails
    showDetailClient.getShowDetails.and.returnValue(throwError(() => ({ status: 500 })));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.state().error).toBeTruthy();

    // Retry should work
    showDetailClient.getShowDetails.and.returnValue(of(mockShow));
    component.retry();
    tick();
    fixture.detectChanges();

    expect(component.state().show).toEqual(mockShow);
    expect(component.state().error).toBe(null);
    expect(showDetailClient.getShowDetails).toHaveBeenCalledTimes(2);
  }));

  it('should display show details when loaded', fakeAsync(() => {
    showDetailClient.getShowDetails.and.returnValue(of(mockShow));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const detailCard = fixture.nativeElement.querySelector('ui-show-detail-card');
    expect(detailCard).toBeTruthy();
  }));

  it('should display loading state', () => {
    showDetailClient.getShowDetails.and.returnValue(of(mockShow));
    
    component.ngOnInit();
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.textContent).toContain('Loading show details...');
  });

  it('should display error state with retry button', fakeAsync(() => {
    showDetailClient.getShowDetails.and.returnValue(throwError(() => ({ status: 404 })));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.error-state');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Show Not Found');
    
    const retryButton = fixture.nativeElement.querySelector('.retry-button');
    expect(retryButton).toBeTruthy();
  }));

  it('should display back navigation link', () => {
    fixture.detectChanges();

    const backLink = fixture.nativeElement.querySelector('.back-link');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('should have proper accessibility attributes', fakeAsync(() => {
    showDetailClient.getShowDetails.and.returnValue(of(mockShow));
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const breadcrumb = fixture.nativeElement.querySelector('.breadcrumb');
    expect(breadcrumb.getAttribute('role')).toBe('navigation');
    expect(breadcrumb.getAttribute('aria-label')).toBe('Breadcrumb');
  }));
});