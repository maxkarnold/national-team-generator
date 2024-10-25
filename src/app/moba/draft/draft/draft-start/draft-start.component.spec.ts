import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftStartComponent } from './draft-start.component';

describe('DraftStartComponent', () => {
  let component: DraftStartComponent;
  let fixture: ComponentFixture<DraftStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftStartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
