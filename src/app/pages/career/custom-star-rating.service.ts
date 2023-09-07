import { Injectable } from '@angular/core';
import { StarRatingConfigService } from 'angular-star-rating';

@Injectable({
  providedIn: 'root',
})
export class CustomStarRatingService extends StarRatingConfigService {
  constructor() {
    super();
    this.staticColor = 'ok';
  }
}
