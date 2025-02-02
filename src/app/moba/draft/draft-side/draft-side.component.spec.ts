import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftSideComponent } from './draft-side.component.js';

describe('DraftRosterComponent', () => {
  let component: DraftSideComponent;
  let fixture: ComponentFixture<DraftSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftSideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
