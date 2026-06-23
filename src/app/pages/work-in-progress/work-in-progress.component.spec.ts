import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkInProgressComponent } from './work-in-progress.component';

describe('WorkInProgressComponent', () => {
  let component: WorkInProgressComponent;
  let fixture: ComponentFixture<WorkInProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkInProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkInProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
