import { Component, Input } from '@angular/core';
import { checkStarRating } from 'app/pages/career/career.utils';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent {

  @Input() rating!: number;
  @Input() size: string = 'rating-md';

  adjustedRating: number;

  checkStarRating = checkStarRating;

  constructor() {
    this.adjustedRating = checkStarRating(this.rating);
  }

  get stars() {
    this.adjustedRating = checkStarRating(this.rating);
    return Array(Math.floor(this.adjustedRating)).fill(0)
  }

}
