import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadRulesComponent } from './squad-rules.component';

describe('SquadRulesComponent', () => {
  let component: SquadRulesComponent;
  let fixture: ComponentFixture<SquadRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquadRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SquadRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
