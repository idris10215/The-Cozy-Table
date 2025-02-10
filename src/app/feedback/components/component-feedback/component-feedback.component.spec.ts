import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFeedbackComponent } from './ComponentFeedbackComponent';


  
  

describe('ComponentFeedbackComponent', () => {
  let component: ComponentFeedbackComponent;
  let fixture: ComponentFixture<ComponentFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentFeedbackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComponentFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
