import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration, ChartData } from 'chart.js';

interface ControlRow {
  name: string;
  tickPercentage: { [date: string]: number };
}

@Component({
  selector: 'app-dashboardv2',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    MatSelectModule
  ],
  templateUrl: './dashboardv2.html',
  styleUrls: ['./dashboardv2.scss']
})
export class Dashboardv2Component implements OnInit {

  /* =========================
     DOMAIN STATE
     ========================= */
  selectedDomain: 'ALL' | 'TRADE' | 'LOAN' | 'SUPPLY' = 'ALL';

  /* =========================
     KPI COUNTS (existing)
     ========================= */
  tradeSuccessCount!: number;
  tradeFailureCount!: number;

  loanSuccessCount!: number;
  loanFailureCount!: number;

  supplySuccessCount!: number;
  supplyFailureCount!: number;

  /* =========================
     FAILED CONTROLS
     ========================= */
  failedControlsToday: string[] = [
    'LC Maturity follow up (B_GBWW_TT-044)',
    'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
    'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
  ];

  /* =========================
     SLA TREND DATA
     ========================= */
  dates: string[] = [
    '20-09-2023',
    '21-09-2023',
    '22-09-2023',
    '23-09-2023',
    '24-09-2023',
    '25-09-2023'
  ];

  controls: ControlRow[] = [];
  selectedControl!: ControlRow;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'SLA Met %',
        data: [],
        borderColor: '#2e7d32',
        backgroundColor: '#2e7d32',
        fill: false,
        tension: 0.3
      },
      {
        label: 'SLA Breach %',
        data: [],
        borderColor: '#c62828',
        backgroundColor: '#c62828',
        fill: false,
        tension: 0.3
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Percentage' }
      },
      x: {
        title: { display: true, text: 'Date' }
      }
    }
  };

  /* =========================
     INIT
     ========================= */
  ngOnInit(): void {
    this.generateRandomCounts();
    this.generateControls();
    this.selectControl(this.controls[0]);
  }

  /* =========================
     KPI DOMAIN HANDLING
     ========================= */
  onDomainSelect(domain: 'TRADE' | 'LOAN' | 'SUPPLY') {
    this.selectedDomain = domain;
  }

  get kpiData() {
    switch (this.selectedDomain) {
      case 'TRADE':
        return {
          success: this.tradeSuccessCount,
          failure: this.tradeFailureCount
        };

      case 'LOAN':
        return {
          success: this.loanSuccessCount,
          failure: this.loanFailureCount
        };

      case 'SUPPLY':
        return {
          success: this.supplySuccessCount,
          failure: this.supplyFailureCount
        };

      default:
        return {
          success:
            this.tradeSuccessCount +
            this.loanSuccessCount +
            this.supplySuccessCount,
          failure:
            this.tradeFailureCount +
            this.loanFailureCount +
            this.supplyFailureCount
        };
    }
  }

  get slaMetPercent(): number {
    const total = this.kpiData.success + this.kpiData.failure;
    return total ? Math.round((this.kpiData.success / total) * 100) : 0;
  }

  get slaBreachPercent(): number {
    return 100 - this.slaMetPercent;
  }

  /* =========================
     CONTROL DROPDOWN (SLA)
     ========================= */
  onSelectControl(ctrl: ControlRow) {
    this.selectControl(ctrl);
  }

  private selectControl(ctrl: ControlRow) {
    this.selectedControl = ctrl;

    const slaMetValues = this.dates.map(
      d => ctrl.tickPercentage[d] ?? 0
    );

    const slaBreachValues = slaMetValues.map(v => 100 - v);

    this.lineChartData = {
      labels: this.dates,
      datasets: [
        { ...this.lineChartData.datasets[0], data: slaMetValues },
        { ...this.lineChartData.datasets[1], data: slaBreachValues }
      ]
    };
  }

  /* =========================
     MOCK DATA GENERATORS
     ========================= */
  private generateRandomCounts() {
    this.tradeSuccessCount = this.randomInt(90, 120);
    this.tradeFailureCount = this.randomInt(10, 30);

    this.loanSuccessCount = this.randomInt(10, 20);
    this.loanFailureCount = this.randomInt(2, 6);

    this.supplySuccessCount = this.randomInt(15, 25);
    this.supplyFailureCount = this.randomInt(3, 8);
  }

  private generateControls() {
    const names = [
      'Incoming Requests Management (B_GBWW_TT-046)',
      'LC Maturity follow up (B_GBWW_TT-044)',
      'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
      'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
    ];

    this.controls = names.map(name => ({
      name,
      tickPercentage: this.generateRandomTickPercentage()
    }));
  }

  private generateRandomTickPercentage(): { [date: string]: number } {
    const acc: any = {};
    this.dates.forEach(d => {
      acc[d] = this.randomInt(30, 95);
    });
    return acc;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}