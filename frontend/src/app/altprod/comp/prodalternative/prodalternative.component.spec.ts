import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdalternativeComponent } from './prodalternative.component';

describe('ProdalternativeComponent', () => {
  let component: ProdalternativeComponent;
  let fixture: ComponentFixture<ProdalternativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdalternativeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdalternativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
