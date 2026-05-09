import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPrestataireComponent } from './header-prestataire';

describe('Dashboard', () => {
  let component: HeaderPrestataireComponent;
  let fixture: ComponentFixture<HeaderPrestataireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderPrestataireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderPrestataireComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
