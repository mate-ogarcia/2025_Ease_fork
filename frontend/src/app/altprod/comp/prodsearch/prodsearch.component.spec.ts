import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdsearchComponent } from './prodsearch.component';

describe('ProdsearchComponent', () => {
  let component: ProdsearchComponent;
  let fixture: ComponentFixture<ProdsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdsearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
