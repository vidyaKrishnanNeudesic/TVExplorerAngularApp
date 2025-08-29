import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ShowDto, Show, mapShow } from './show-search.client';

@Injectable({
  providedIn: 'root'
})
export class ShowDetailClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.tvmaze.com';

  /**
   * Get detailed information for a specific TV show
   * @param id - Show ID (must be a positive number)
   * @returns Observable of show details
   */
  getShowDetails(id: number): Observable<Show> {
    if (!id || id <= 0) {
      throw new Error('Show ID must be a positive number');
    }

    return this.http.get<ShowDto>(`${this.baseUrl}/shows/${id}`)
      .pipe(
        map(mapShow)
      );
  }
}