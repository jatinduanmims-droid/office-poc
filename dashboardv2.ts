import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData, Plugin } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-dashboard-v2',
  templateUrl: './dashboard-v2.component.html',
  styleUrls: ['./dashboard-v2.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgChartsModule,
    ReactiveFormsModule
  ]
})
export class DashboardV2Component implements OnInit {

  /* ==========================
     EXISTING VARIABLES (UNCHANGED)
     ========================== */

  donutLabels: string[] = ['Successful', 'Unsuccessful'];

  donutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false }
    }
  };

  // Trade
  tradeSuccessCount!: number;
  tradeFailureCount!: number;
  tradeDonutData!: ChartData<'doughnut'>;

  // Loan
  loanSuccessCount!: number;
  loanFailureCount!: number;
  loanDonutData!: ChartData<'doughnut'>;

  // Supply Chain
  supplySuccessCount!: number;
  supplyFailureCount!: number;
  supplyDonutData!: ChartData<'doughnut'>;

  failedControlsToday: string[] = [
    'LC Maturity follow up (B_GBWW_TT-044)',
    'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
    'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
  ];

  dates: string[] = [
    '24-09-2025',
    '25-09-2025',
    '26-09-2025',
    '27-09-2025',
    '28-09-2025',
    '29-09-2025'
  ];

  chartPlugins: Plugin<any>[] = [];

  controls: any[] = [];
  recentControls: any[] = [];

  searchControl = new FormControl('');
  filteredControls$!: Observable<any[]>;

  selectedControl: any | null = null;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'SLA Met %',
        data: [],
        borderColor: '#2e7d32',
        tension: 0.3
      },
      {
        label: 'SLA Breach %',
        data: [],
        borderColor: '#c62828',
        tension: 0.3
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100 }
    }
  };

  /* ==========================
     LIFECYCLE (UNCHANGED)
     ========================== */

  ngOnInit(): void {
    this.generateRandomDonutData();

    const names = [
      'Incoming Requests Management (B_GBWW_TT-046)',
      'L/C Maturity follow up (B_GBWW_TT-044)',
      'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
      'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
    ];

    this.controls = names.map(name => ({
      name,
      tickPercentage: this.generateRandomTickPercentage()
    }));

    this.selectedControl = this.controls[0];
    this.selectControl(this.selectedControl);

    this.filteredControls$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        const term = typeof value === 'string' ? value.toLowerCase() : '';
        if (term.length < 2) return this.recentControls;
        return this.controls.filter(c => c.name.toLowerCase().includes(term));
      })
    );
  }

  /* ==========================
     EXISTING METHODS (UNCHANGED)
     ========================== */

  onSelectControl(ctrl: any): void {
    this.selectControl(ctrl);
    this.recentControls = [ctrl, ...this.recentControls.filter(c => c.name !== ctrl.name)].slice(0, 3);
    this.searchControl.setValue(ctrl.name);
  }

  private selectControl(ctrl: any): void {
    if (!ctrl) return;

    this.selectedControl = ctrl;
    const tick = ctrl.tickPercentage;

    this.lineChartData = {
      labels: this.dates,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.dates.map(d => tick[d] ?? 0)
        },
        {
          ...this.lineChartData.datasets[1],
          data: this.dates.map(d => 100 - (tick[d] ?? 0))
        }
      ]
    };
  }

  private generateRandomDonutData(): void {
    this.tradeSuccessCount = this.randomInt(70, 120);
    this.tradeFailureCount = this.randomInt(10, 30);
    this.tradeDonutData = this.buildDonutChartData(this.tradeSuccessCount, this.tradeFailureCount);

    this.loanSuccessCount = this.randomInt(80, 130);
    this.loanFailureCount = this.randomInt(5, 25);
    this.loanDonutData = this.buildDonutChartData(this.loanSuccessCount, this.loanFailureCount);

    this.supplySuccessCount = this.randomInt(60, 110);
    this.supplyFailureCount = this.randomInt(8, 22);
    this.supplyDonutData = this.buildDonutChartData(this.supplySuccessCount, this.supplyFailureCount);
  }

  private buildDonutChartData(success: number, failure: number): ChartData<'doughnut'> {
    return {
      labels: this.donutLabels,
      datasets: [{
        data: [success, failure],
        backgroundColor: ['#2e7d32', '#c62828']
      }]
    };
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateRandomTickPercentage(): { [date: string]: number } {
    return this.dates.reduce((acc, d) => {
      acc[d] = Math.floor(Math.random() * 100);
      return acc;
    }, {} as { [key: string]: number });
  }
}