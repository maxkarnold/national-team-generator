import { TestBed } from '@angular/core/testing';

import { SimulationQualifiersService } from './simulation-qualifiers.service';

describe('SimulationQualifiersService', () => {
  let service: SimulationQualifiersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulationQualifiersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
