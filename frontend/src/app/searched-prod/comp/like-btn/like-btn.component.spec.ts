import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikeBtnComponent } from './like-btn.component';

describe('LikeBtnComponent', () => {
  let component: LikeBtnComponent;
  let fixture: ComponentFixture<LikeBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikeBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LikeBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
