import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentFormComponent } from './tournament-form.component';

describe('TournamentFormComponent', () => {
  let component: TournamentFormComponent;
  let fixture: ComponentFixture<TournamentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TournamentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
