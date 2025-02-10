import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltprodComponent } from './altprod.component';

describe('AltprodComponent', () => {
  let component: AltprodComponent;
  let fixture: ComponentFixture<AltprodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltprodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltprodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
