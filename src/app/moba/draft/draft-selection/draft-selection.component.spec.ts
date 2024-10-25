import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftSelectionComponent } from './draft-selection.component';

describe('DraftSelectionComponent', () => {
  let component: DraftSelectionComponent;
  let fixture: ComponentFixture<DraftSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
