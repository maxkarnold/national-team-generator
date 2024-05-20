import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSelectComponent } from './player-select.component';

describe('PlayerSelectComponent', () => {
  let component: PlayerSelectComponent;
  let fixture: ComponentFixture<PlayerSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
