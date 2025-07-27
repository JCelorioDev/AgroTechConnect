import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCommentComponent } from './show-comment.component';

describe('ShowCommentComponent', () => {
  let component: ShowCommentComponent;
  let fixture: ComponentFixture<ShowCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
