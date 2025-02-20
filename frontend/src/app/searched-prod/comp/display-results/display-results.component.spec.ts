import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayResultsComponent } from './display-results.component';

describe('DisplayResultsComponent', () => {
  let component: DisplayResultsComponent;
  let fixture: ComponentFixture<DisplayResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
