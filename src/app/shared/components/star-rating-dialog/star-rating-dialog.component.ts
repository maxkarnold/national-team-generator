import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StarRatingConfigService } from 'angular-star-rating';
import { CareerOverview } from 'app/pages/career/career.model';
import { isHalfStar } from 'app/pages/career/career.utils';
import { CustomStarRatingService } from 'app/pages/career/custom-star-rating.service';

@Component({
  selector: 'app-star-rating-dialog',
  templateUrl: './star-rating-dialog.component.html',
  styleUrls: ['./star-rating-dialog.component.scss'],
  providers: [
    {
      provide: StarRatingConfigService,
      useClass: CustomStarRatingService,
    },
  ],
})
export class StarRatingDialogComponent implements OnInit, OnDestroy {
  @Input() career!: CareerOverview;
  @ViewChild('starRatingDialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  isHalfStar = isHalfStar;

  constructor() {}

  ngOnInit(): void {
    // this.dialog.nativeElement.showModal();
  }

  ngOnDestroy(): void {
    // this.dialog.nativeElement.close();
  }
}
