import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PitchViewComponent } from './pitch-view.component';

describe('PitchViewComponent', () => {
  let component: PitchViewComponent;
  let fixture: ComponentFixture<PitchViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PitchViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PitchViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
