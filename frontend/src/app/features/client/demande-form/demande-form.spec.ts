import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeForm } from './demande-form';

describe('DemandeForm', () => {
  let component: DemandeForm;
  let fixture: ComponentFixture<DemandeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DemandeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
