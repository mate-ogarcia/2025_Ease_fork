import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsercompComponent } from './usercomp.component';

describe('UsercompComponent', () => {
  let component: UsercompComponent;
  let fixture: ComponentFixture<UsercompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsercompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsercompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
