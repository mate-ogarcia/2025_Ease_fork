import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterprodComponent } from './alterprod.component';

describe('AlterprodComponent', () => {
  let component: AlterprodComponent;
  let fixture: ComponentFixture<AlterprodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlterprodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlterprodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
