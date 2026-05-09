import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prestataires } from './prestataires';

describe('Prestataires', () => {
  let component: Prestataires;
  let fixture: ComponentFixture<Prestataires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prestataires],
    }).compileComponents();

    fixture = TestBed.createComponent(Prestataires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
