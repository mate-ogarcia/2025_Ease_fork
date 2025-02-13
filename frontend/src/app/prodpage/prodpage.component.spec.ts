import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdpageComponent } from './prodpage.component';

describe('ProdpageComponent', () => {
  let component: ProdpageComponent;
  let fixture: ComponentFixture<ProdpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
