import { TestBed } from '@angular/core/testing';

import { CreateRosterService } from './create-roster.service';

describe('GenerateRosterService', () => {
  let service: CreateRosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateRosterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
