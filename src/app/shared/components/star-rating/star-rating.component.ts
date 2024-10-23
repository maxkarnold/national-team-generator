import { Component, HostListener, Input } from '@angular/core';
import { checkHalfStar } from 'app/football/career/career.utils';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent {
  @Input() rating!: number;
  @Input() size: string = 'rating-md';

  adjustedRating: number;
  screenWidth: number;

  constructor() {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    this.adjustedRating = checkHalfStar(this.rating);
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  get stars() {
    this.adjustedRating = checkHalfStar(this.rating);
    return Array(Math.floor(this.adjustedRating)).fill(0);
  }
}
