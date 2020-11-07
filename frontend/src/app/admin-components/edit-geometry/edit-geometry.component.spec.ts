import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGeometryComponent } from './edit-geometry.component';

describe('EditGeometryComponent', () => {
  let component: EditGeometryComponent;
  let fixture: ComponentFixture<EditGeometryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGeometryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
