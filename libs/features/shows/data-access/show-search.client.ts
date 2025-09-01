import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// TV Maze API DTOs
export interface ShowSearchDto {
  score: number;
  show: ShowDto;
}

export interface ShowDto {
  id: number;
  name: string;
  image?: {
    medium?: string;
    original?: string;
  };
  genres: string[];
  rating?: {
    average?: number;
  };
  summary?: string;
  schedule?: {
    time?: string;
    days?: string[];
  };
}

// Domain Models
export interface Show {
  id: number;
  title: string;
  image?: string;
  genres: readonly string[];
  rating?: number;
  summary?: string;
  schedule?: {
    time?: string;
    days?: readonly string[];
  };
}

export interface ShowSearchResult {
  shows: Show[];
  state: 'loading' | 'success' | 'no_results' | 'error';
  error?: {
    message: string;
  };
}

// Pure mappers
export const mapShow = (dto: ShowDto): Show => ({
  id: dto.id,
  title: dto.name,
  image: dto.image?.medium ?? undefined,
  genres: dto.genres ?? [],
  rating: dto.rating?.average ?? undefined,
  summary: dto.summary ?? undefined,
  schedule: dto.schedule ? {
    time: dto.schedule.time ?? undefined,
    days: dto.schedule.days ?? []
  } : undefined,
});

export const mapShowSearchResult = (searchResults: ShowSearchDto[]): Show[] => {
  return searchResults.map(result => mapShow(result.show));
};

@Injectable({
  providedIn: 'root'
})
export class ShowSearchClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.tvmaze.com';

  /**
   * Search for TV shows by query string
   * @param query - Search query (must be non-empty)
   * @returns Observable of shows matching the query
   */
  searchShows(query: string): Observable<Show[]> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    const params = new HttpParams().set('q', query.trim());
    
    return this.http.get<ShowSearchDto[]>(`${this.baseUrl}/search/shows`, { params })
      .pipe(
        map(mapShowSearchResult)
      );
  }
}