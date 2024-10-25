import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftRosterComponent } from './draft-roster.component';

describe('DraftRosterComponent', () => {
  let component: DraftRosterComponent;
  let fixture: ComponentFixture<DraftRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftRosterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
