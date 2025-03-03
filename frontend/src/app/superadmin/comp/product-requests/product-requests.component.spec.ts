import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRequestsComponent } from './product-requests.component';

describe('ProductRequestsComponent', () => {
  let component: ProductRequestsComponent;
  let fixture: ComponentFixture<ProductRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
