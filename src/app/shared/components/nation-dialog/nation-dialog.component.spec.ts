import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationDialogComponent } from './nation-dialog.component';

describe('NationDialogComponent', () => {
  let component: NationDialogComponent;
  let fixture: ComponentFixture<NationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
