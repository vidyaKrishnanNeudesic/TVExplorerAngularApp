import { Component, input, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';

@Component({
  selector: 'ui-show-detail-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="show-detail-card" [attr.aria-label]="ariaLabel()">
      <div class="show-detail-card__header">
        <div class="show-detail-card__image-container">
          @if (show().image) {
            <img 
              [src]="show().image!"
              [alt]="show().title"
              class="show-detail-card__image"
            />
          } @else {
            <div class="show-detail-card__placeholder" [attr.aria-label]="'No image available for ' + show().title">
              <span class="show-detail-card__placeholder-text">No Image Available</span>
            </div>
          }
        </div>
        
        <div class="show-detail-card__info">
          <h1 class="show-detail-card__title">{{ show().title }}</h1>
          
          @if (show().rating) {
            <div class="show-detail-card__rating" [attr.aria-label]="ratingAriaLabel()">
              <span class="show-detail-card__rating-value">★ {{ show().rating }}</span>
              <span class="show-detail-card__rating-text">out of 10</span>
            </div>
          }
          
          @if (genresDisplay(); as genres) {
            <div class="show-detail-card__genres" [attr.aria-label]="'Genres: ' + genres">
              <span class="show-detail-card__genres-label">Genres:</span>
              <span class="show-detail-card__genres-text">{{ genres }}</span>
            </div>
          }
          
          @if (scheduleDisplay(); as schedule) {
            <div class="show-detail-card__schedule" [attr.aria-label]="'Schedule: ' + schedule">
              <span class="show-detail-card__schedule-label">Schedule:</span>
              <span class="show-detail-card__schedule-text">{{ schedule }}</span>
            </div>
          }
        </div>
      </div>
      
      @if (sanitizedSummary(); as summary) {
        <div class="show-detail-card__summary">
          <h2 class="show-detail-card__summary-title">Summary</h2>
          <div 
            class="show-detail-card__summary-content" 
            [innerHTML]="summary"
            [attr.aria-label]="'Show summary'"
          ></div>
        </div>
      }
    </article>
  `,
  styleUrls: ['./show-detail-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowDetailCardComponent {
  readonly show = input.required<Show>();
  
  private readonly sanitizer = inject(DomSanitizer);

  readonly ariaLabel = computed(() => 
    `${this.show().title} TV show details`
  );

  readonly ratingAriaLabel = computed(() => 
    `Rating ${this.show().rating} out of 10`
  );

  readonly genresDisplay = computed(() => {
    const genres = this.show().genres;
    return genres.length > 0 ? genres.join(', ') : null;
  });

  readonly scheduleDisplay = computed(() => {
    const schedule = this.show().schedule;
    if (!schedule) return null;
    
    const parts: string[] = [];
    if (schedule.days && schedule.days.length > 0) {
      parts.push(schedule.days.join(', '));
    }
    if (schedule.time) {
      parts.push(`at ${schedule.time}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
  });

  readonly sanitizedSummary = computed((): SafeHtml | null => {
    const summary = this.show().summary;
    if (!summary) return null;
    
    // Sanitize HTML content to prevent XSS
    return this.sanitizer.sanitize(4, summary); // 4 = SecurityContext.HTML
  });
}