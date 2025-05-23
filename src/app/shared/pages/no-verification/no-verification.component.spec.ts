import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoVerificationComponent } from './no-verification.component';

describe('NoVerificationComponent', () => {
  let component: NoVerificationComponent;
  let fixture: ComponentFixture<NoVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
