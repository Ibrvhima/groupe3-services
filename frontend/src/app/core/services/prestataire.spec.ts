import { TestBed } from '@angular/core/testing';

import { Prestataire } from './prestataire';

describe('Prestataire', () => {
  let service: Prestataire;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Prestataire);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
