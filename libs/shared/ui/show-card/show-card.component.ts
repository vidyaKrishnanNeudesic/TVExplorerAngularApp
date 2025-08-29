import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';

@Component({
  selector: 'ui-show-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article 
      class="show-card"
      [attr.aria-label]="ariaLabel()"
      role="img"
    >
      @if (show().image) {
        <img 
          [src]="show().image!"
          [alt]="show().title"
          class="show-card__image"
          loading="lazy"
        />
      } @else {
        <div class="show-card__placeholder" [attr.aria-label]="'No image available for ' + show().title">
          <span class="show-card__placeholder-text">No Image</span>
        </div>
      }
      
      <div class="show-card__content">
        <h3 class="show-card__title">{{ show().title }}</h3>
        
        @if (show().rating) {
          <div class="show-card__rating" [attr.aria-label]="ratingAriaLabel()">
            <span class="show-card__rating-value">★ {{ show().rating }}</span>
          </div>
        }
        
        @if (genresDisplay(); as genres) {
          <div class="show-card__genres" [attr.aria-label]="'Genres: ' + genres">
            <span class="show-card__genres-text">{{ genres }}</span>
          </div>
        }
      </div>
    </article>
  `,
  styleUrls: ['./show-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowCardComponent {
  readonly show = input.required<Show>();

  readonly ariaLabel = computed(() => 
    `${this.show().title} TV show card`
  );

  readonly ratingAriaLabel = computed(() => 
    `Rating ${this.show().rating} out of 10`
  );

  readonly genresDisplay = computed(() => {
    const genres = this.show().genres;
    return genres.length > 0 ? genres.join(', ') : null;
  });
}