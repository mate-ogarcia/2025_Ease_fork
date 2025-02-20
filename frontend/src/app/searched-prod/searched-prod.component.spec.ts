import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedProdComponent } from './searched-prod.component';

describe('SearchedProdComponent', () => {
  let component: SearchedProdComponent;
  let fixture: ComponentFixture<SearchedProdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchedProdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchedProdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
