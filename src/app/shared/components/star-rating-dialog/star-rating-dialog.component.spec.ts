import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRatingDialogComponent } from './star-rating-dialog.component';

describe('StarRatingDialogComponent', () => {
  let component: StarRatingDialogComponent;
  let fixture: ComponentFixture<StarRatingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarRatingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarRatingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
