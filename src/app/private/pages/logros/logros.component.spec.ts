import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogrosComponent } from './logros.component';

describe('LogrosComponent', () => {
  let component: LogrosComponent;
  let fixture: ComponentFixture<LogrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
