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
  imports: [CommonModule, NgChartsModule, MatSelectModule],
  templateUrl: './dashboardv2.html',
  styleUrls: ['./dashboardv2.scss']
})
export class Dashboardv2Component implements OnInit {

  /* ================= DOMAIN ================= */
  selectedDomain: 'ALL' | 'TRADE' | 'LOAN' | 'SUPPLY' = 'ALL';

  /* ================= KPI COUNTS ================= */
  tradeSuccessCount = 120;
  tradeFailureCount = 13;

  loanSuccessCount = 17;
  loanFailureCount = 4;

  supplySuccessCount = 18;
  supplyFailureCount = 5;

  /* ================= ANIMATED KPI ================= */
  animatedSuccess = 0;
  animatedFailure = 0;
  animatedSlaMet = 0;
  animatedSlaBreach = 0;

  /* ================= FAILED CONTROLS ================= */
  failedControlsToday: string[] = [
    'LC Maturity follow up (B_GBWW_TT-044)',
    'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
    'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
  ];

  /* ================= SLA TREND ================= */
  dates = ['20-09-2023', '21-09-2023', '22-09-2023', '23-09-2023', '24-09-2023'];

  controls: ControlRow[] = [];
  selectedControl!: ControlRow;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { label: 'SLA Met %', data: [], borderColor: '#2e7d32', tension: 0.3 },
      { label: 'SLA Breach %', data: [], borderColor: '#c62828', tension: 0.3 }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100 },
      x: {}
    }
  };

  ngOnInit(): void {
    this.generateControls();
    this.selectControl(this.controls[0]);
    this.animateKpis();
  }

  /* ================= KPI LOGIC ================= */
  get kpiData() {
    switch (this.selectedDomain) {
      case 'TRADE':
        return { success: this.tradeSuccessCount, failure: this.tradeFailureCount };
      case 'LOAN':
        return { success: this.loanSuccessCount, failure: this.loanFailureCount };
      case 'SUPPLY':
        return { success: this.supplySuccessCount, failure: this.supplyFailureCount };
      default:
        return {
          success: this.tradeSuccessCount + this.loanSuccessCount + this.supplySuccessCount,
          failure: this.tradeFailureCount + this.loanFailureCount + this.supplyFailureCount
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

  onDomainSelect(domain: 'TRADE' | 'LOAN' | 'SUPPLY') {
    this.selectedDomain = domain;
    this.animateKpis();
  }

  /* ================= KPI ANIMATION ================= */
  private animateKpis() {
    this.animateValue('animatedSuccess', this.kpiData.success);
    this.animateValue('animatedFailure', this.kpiData.failure);
    this.animateValue('animatedSlaMet', this.slaMetPercent);
    this.animateValue('animatedSlaBreach', this.slaBreachPercent);
  }

  private animateValue(
    field: 'animatedSuccess' | 'animatedFailure' | 'animatedSlaMet' | 'animatedSlaBreach',
    target: number
  ) {
    this[field] = 0;
    const step = Math.max(1, Math.floor(target / 25));
    const interval = setInterval(() => {
      if (this[field] < target) {
        this[field] += step;
      } else {
        this[field] = target;
        clearInterval(interval);
      }
    }, 16);
  }

  /* ================= SLA ================= */
  onSelectControl(ctrl: ControlRow) {
    this.selectControl(ctrl);
  }

  private selectControl(ctrl: ControlRow) {
    this.selectedControl = ctrl;

    const met = this.dates.map(d => ctrl.tickPercentage[d]);
    const breach = met.map(v => 100 - v);

    this.lineChartData = {
      labels: this.dates,
      datasets: [
        { ...this.lineChartData.datasets[0], data: met },
        { ...this.lineChartData.datasets[1], data: breach }
      ]
    };
  }

  private generateControls() {
    const names = [
      'Incoming Requests Management (B_GBWW_TT-046)',
      'LC Maturity follow up (B_GBWW_TT-044)',
      'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)'
    ];

    this.controls = names.map(n => ({
      name: n,
      tickPercentage: this.dates.reduce((a: any, d) => {
        a[d] = Math.floor(Math.random() * 60) + 30;
        return a;
      }, {})
    }));
  }
}