import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnockoutStageComponent } from './knockout-stage.component';

describe('KnockoutStageComponent', () => {
  let component: KnockoutStageComponent;
  let fixture: ComponentFixture<KnockoutStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnockoutStageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnockoutStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
