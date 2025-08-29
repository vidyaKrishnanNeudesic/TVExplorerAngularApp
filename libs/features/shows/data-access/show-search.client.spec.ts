import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ShowSearchClient, mapShow, mapShowSearchResult, ShowDto, ShowSearchDto } from './show-search.client';

describe('ShowSearchClient', () => {
  let service: ShowSearchClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ShowSearchClient
      ]
    });
    service = TestBed.inject(ShowSearchClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('searchShows', () => {
    it('should search for shows with valid query', () => {
      const query = 'game of thrones';
      const mockResponse: ShowSearchDto[] = [
        {
          score: 0.9,
          show: {
            id: 82,
            name: 'Game of Thrones',
            genres: ['Drama', 'Adventure', 'Fantasy'],
            image: {
              medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg',
              original: 'https://static.tvmaze.com/uploads/images/original_untouched/190/476117.jpg'
            },
            rating: {
              average: 9.0
            },
            summary: '<p>A fantasy drama series</p>'
          }
        }
      ];

      service.searchShows(query).subscribe(shows => {
        expect(shows.length).toBe(1);
        expect(shows[0]).toEqual({
          id: 82,
          title: 'Game of Thrones',
          genres: ['Drama', 'Adventure', 'Fantasy'],
          image: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg',
          rating: 9.0,
          summary: '<p>A fantasy drama series</p>'
        });
      });

      const req = httpMock.expectOne('https://api.tvmaze.com/search/shows?q=game%20of%20thrones');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error for empty query', () => {
      expect(() => service.searchShows('')).toThrow('Search query cannot be empty');
      expect(() => service.searchShows('   ')).toThrow('Search query cannot be empty');
    });

    it('should trim whitespace from query', () => {
      const query = '  game of thrones  ';
      const mockResponse: ShowSearchDto[] = [];

      service.searchShows(query).subscribe();

      const req = httpMock.expectOne('https://api.tvmaze.com/search/shows?q=game%20of%20thrones');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty search results', () => {
      const query = 'nonexistent show';
      const mockResponse: ShowSearchDto[] = [];

      service.searchShows(query).subscribe(shows => {
        expect(shows).toEqual([]);
      });

      const req = httpMock.expectOne('https://api.tvmaze.com/search/shows?q=nonexistent%20show');
      req.flush(mockResponse);
    });
  });
});

describe('mapShow', () => {
  it('should map DTO to domain model with all properties', () => {
    const dto: ShowDto = {
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
      summary: '<p>Test summary</p>'
    };

    const result = mapShow(dto);

    expect(result).toEqual({
      id: 1,
      title: 'Test Show',
      genres: ['Drama', 'Comedy'],
      image: 'https://example.com/medium.jpg',
      rating: 8.5,
      summary: '<p>Test summary</p>'
    });
  });

  it('should handle missing optional properties', () => {
    const dto: ShowDto = {
      id: 1,
      name: 'Test Show',
      genres: []
    };

    const result = mapShow(dto);

    expect(result).toEqual({
      id: 1,
      title: 'Test Show',
      genres: [],
      image: undefined,
      rating: undefined,
      summary: undefined
    });
  });

  it('should handle missing image', () => {
    const dto: ShowDto = {
      id: 1,
      name: 'Test Show',
      genres: [],
      image: {}
    };

    const result = mapShow(dto);

    expect(result.image).toBeUndefined();
  });

  it('should handle missing rating', () => {
    const dto: ShowDto = {
      id: 1,
      name: 'Test Show',
      genres: [],
      rating: {}
    };

    const result = mapShow(dto);

    expect(result.rating).toBeUndefined();
  });
});

describe('mapShowSearchResult', () => {
  it('should map array of search results', () => {
    const searchResults: ShowSearchDto[] = [
      {
        score: 0.9,
        show: {
          id: 1,
          name: 'Show 1',
          genres: ['Drama']
        }
      },
      {
        score: 0.8,
        show: {
          id: 2,
          name: 'Show 2',
          genres: ['Comedy']
        }
      }
    ];

    const result = mapShowSearchResult(searchResults);

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({
      id: 1,
      title: 'Show 1',
      genres: ['Drama'],
      image: undefined,
      rating: undefined,
      summary: undefined
    });
    expect(result[1]).toEqual({
      id: 2,
      title: 'Show 2',
      genres: ['Comedy'],
      image: undefined,
      rating: undefined,
      summary: undefined
    });
  });

  it('should handle empty search results', () => {
    const result = mapShowSearchResult([]);
    expect(result).toEqual([]);
  });
});