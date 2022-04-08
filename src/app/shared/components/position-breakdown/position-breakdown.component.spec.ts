import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionBreakdownComponent } from './position-breakdown.component';

describe('PositionBreakdownComponent', () => {
  let component: PositionBreakdownComponent;
  let fixture: ComponentFixture<PositionBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionBreakdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
