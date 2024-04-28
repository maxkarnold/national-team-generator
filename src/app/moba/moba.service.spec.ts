import { TestBed } from '@angular/core/testing';

import { MobaService } from './moba.service';

describe('MobaService', () => {
  let service: MobaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
