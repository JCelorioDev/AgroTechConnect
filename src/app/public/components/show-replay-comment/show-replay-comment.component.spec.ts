import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReplayCommentComponent } from './show-replay-comment.component';

describe('ShowReplayCommentComponent', () => {
  let component: ShowReplayCommentComponent;
  let fixture: ComponentFixture<ShowReplayCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReplayCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowReplayCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
