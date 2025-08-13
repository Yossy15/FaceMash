import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowprofileComponent } from './showprofile.component';

describe('ShowprofileComponent', () => {
  let component: ShowprofileComponent;
  let fixture: ComponentFixture<ShowprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowprofileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
