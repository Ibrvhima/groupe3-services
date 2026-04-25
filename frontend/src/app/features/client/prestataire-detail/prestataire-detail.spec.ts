import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireDetail } from './prestataire-detail';

describe('PrestataireDetail', () => {
  let component: PrestataireDetail;
  let fixture: ComponentFixture<PrestataireDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestataireDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PrestataireDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
