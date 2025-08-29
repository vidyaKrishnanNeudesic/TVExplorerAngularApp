import { Component } from '@angular/core';
import { ShowCardComponent } from '@tv-explorer/shared/ui/show-card/show-card.component';
import { Show } from '@tv-explorer/features/shows/data-access/show-search.client';

@Component({
  selector: 'demo-show-grid',
  standalone: true,
  imports: [ShowCardComponent],
  template: `
    <div class="demo-container">
      <h2>TV Show Search Demo - Sample Results</h2>
      <div class="results-grid">
        @for (show of sampleShows; track show.id) {
          <ui-show-card [show]="show" />
        }
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }
    
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 1rem 0;
    }
  `]
})
export class DemoShowGridComponent {
  readonly sampleShows: Show[] = [
    {
      id: 82,
      title: 'Game of Thrones',
      image: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg',
      genres: ['Drama', 'Adventure', 'Fantasy'],
      rating: 9.0,
      summary: '<p>Nine noble families fight for control over the lands of Westeros.</p>'
    },
    {
      id: 169,
      title: 'Breaking Bad',
      image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg',
      genres: ['Drama', 'Crime', 'Thriller'],
      rating: 9.5,
      summary: '<p>A high school chemistry teacher turned methamphetamine producer.</p>'
    },
    {
      id: 143,
      title: 'The Walking Dead',
      image: 'https://static.tvmaze.com/uploads/images/medium_portrait/67/168817.jpg',
      genres: ['Drama', 'Action', 'Horror'],
      rating: 8.1,
      summary: '<p>Sheriff Rick Grimes wakes up from a coma to find the world overrun with zombies.</p>'
    },
    {
      id: 73,
      title: 'The Big Bang Theory',
      image: 'https://static.tvmaze.com/uploads/images/medium_portrait/66/165988.jpg',
      genres: ['Comedy'],
      rating: 8.2,
      summary: '<p>Four scientists and their neighbor Penny navigate relationships and careers.</p>'
    }
  ];
}