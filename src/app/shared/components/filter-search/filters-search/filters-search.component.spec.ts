import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersSearchComponent } from './filters-search.component';

describe('FiltersSearchComponent', () => {
  let component: FiltersSearchComponent;
  let fixture: ComponentFixture<FiltersSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
