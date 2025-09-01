import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ShowDetailClient } from './show-detail.client';
import { ShowDto } from './show-search.client';

describe('ShowDetailClient', () => {
  let service: ShowDetailClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ShowDetailClient
      ]
    });
    service = TestBed.inject(ShowDetailClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getShowDetails', () => {
    it('should get show details with valid ID', () => {
      const showId = 1;
      const mockResponse: ShowDto = {
        id: 1,
        name: 'Test Show',
        genres: ['Drama', 'Comedy'],
        image: {
          medium: 'https://example.com/medium.jpg',
          original: 'https://example.com/original.jpg'
        },
        rating: {
          average: 8.5
        },
        summary: '<p>Test summary</p>',
        schedule: {
          time: '20:00',
          days: ['Monday', 'Tuesday']
        }
      };

      service.getShowDetails(showId).subscribe(show => {
        expect(show).toEqual({
          id: 1,
          title: 'Test Show',
          genres: ['Drama', 'Comedy'],
          image: 'https://example.com/medium.jpg',
          rating: 8.5,
          summary: '<p>Test summary</p>',
          schedule: {
            time: '20:00',
            days: ['Monday', 'Tuesday']
          }
        });
      });

      const req = httpMock.expectOne('https://api.tvmaze.com/shows/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle show details without optional fields', () => {
      const showId = 2;
      const mockResponse: ShowDto = {
        id: 2,
        name: 'Simple Show',
        genres: []
      };

      service.getShowDetails(showId).subscribe(show => {
        expect(show).toEqual({
          id: 2,
          title: 'Simple Show',
          genres: [],
          image: undefined,
          rating: undefined,
          summary: undefined,
          schedule: undefined
        });
      });

      const req = httpMock.expectOne('https://api.tvmaze.com/shows/2');
      req.flush(mockResponse);
    });

    it('should throw error for invalid ID', () => {
      expect(() => service.getShowDetails(0)).toThrowError('Show ID must be a positive number');
      expect(() => service.getShowDetails(-1)).toThrowError('Show ID must be a positive number');
      expect(() => service.getShowDetails(null as any)).toThrowError('Show ID must be a positive number');
    });

    it('should handle HTTP errors', () => {
      const showId = 999;
      
      service.getShowDetails(showId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('https://api.tvmaze.com/shows/999');
      req.flush('Show not found', { status: 404, statusText: 'Not Found' });
    });
  });
});