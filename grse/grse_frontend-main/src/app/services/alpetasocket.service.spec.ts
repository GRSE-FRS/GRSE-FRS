import { TestBed } from '@angular/core/testing';

import { AlpetasocketService } from './alpetasocket.service';

describe('AlpetasocketService', () => {
  let service: AlpetasocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlpetasocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
