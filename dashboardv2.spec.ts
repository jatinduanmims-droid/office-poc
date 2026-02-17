import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboardv2Component } from './dashboardv2';

describe('Dashboardv2Component', () => {
  let component: Dashboardv2Component;
  let fixture: ComponentFixture<Dashboardv2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboardv2Component]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboardv2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dashboard v2 component', () => {
    expect(component).toBeTruthy();
  });
});