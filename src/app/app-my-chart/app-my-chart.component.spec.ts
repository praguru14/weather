import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMyChartComponent } from './app-my-chart.component';

describe('AppMyChartComponent', () => {
  let component: AppMyChartComponent;
  let fixture: ComponentFixture<AppMyChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMyChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppMyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
