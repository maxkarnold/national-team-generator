import { TestBed } from '@angular/core/testing';

import { CustomStarRatingService } from './custom-star-rating.service';

describe('CustomStarRatingService', () => {
  let service: CustomStarRatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomStarRatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
