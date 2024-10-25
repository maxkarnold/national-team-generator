import { TestBed } from '@angular/core/testing';

import { CreatePlayerService } from './create-player.service';

describe('CreatePlayerService', () => {
  let service: CreatePlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreatePlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
