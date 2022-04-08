import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineupAccordionComponent } from './lineup-accordion.component';

describe('LineupAccordionComponent', () => {
  let component: LineupAccordionComponent;
  let fixture: ComponentFixture<LineupAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineupAccordionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineupAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
