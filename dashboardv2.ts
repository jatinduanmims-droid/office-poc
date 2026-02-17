import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

interface DomainData {
  success: number;
  failure: number;
  total: number;
  slaMet: number;
  slaBreach: number;
}

@Component({
  selector: 'app-dashboardv2',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboardv2.html',
  styleUrls: ['./dashboardv2.scss']
})
export class DashboardV2Component implements OnInit {

  /* ================= KPIs ================= */
  totalControls = 0;
  totalSuccess = 0;
  totalFailure = 0;
  slaMet = 0;
  slaBreach = 0;

  /* ================= Domains ================= */
  selectedDomain: 'trade' | 'loan' | 'supply' | 'all' = 'all';

  trade!: DomainData;
  loan!: DomainData;
  supply!: DomainData;

  /* ================= Failed Controls ================= */
  failedControls: string[] = [
    'LC Maturity follow up (B_GBWW_TT-044)',
    'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
    'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
  ];

  /* ================= Progress % ================= */
  tradeSuccessPercent = 0;
  tradeFailurePercent = 0;
  loanSuccessPercent = 0;
  loanFailurePercent = 0;
  supplySuccessPercent = 0;
  supplyFailurePercent = 0;

  /* ================= SLA Chart ================= */
  lineChartData!: ChartData<'line'>;
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100 }
    },
    plugins: {
      legend: { display: true }
    }
  };

  ngOnInit(): void {
    this.generateRandomData();
    this.updateKPIs('all');
    this.buildChart();
  }

  /* ================= Random Data ================= */
  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateDomain(): DomainData {
    const success = this.random(10, 120);
    const failure = this.random(3, 30);
    const total = success + failure;
    const slaMet = Math.round((success / total) * 100);
    return {
      success,
      failure,
      total,
      slaMet,
      slaBreach: 100 - slaMet
    };
  }

  private generateRandomData(): void {
    this.trade = this.generateDomain();
    this.loan = this.generateDomain();
    this.supply = this.generateDomain();

    this.tradeSuccessPercent = (this.trade.success / this.trade.total) * 100;
    this.tradeFailurePercent = (this.trade.failure / this.trade.total) * 100;

    this.loanSuccessPercent = (this.loan.success / this.loan.total) * 100;
    this.loanFailurePercent = (this.loan.failure / this.loan.total) * 100;

    this.supplySuccessPercent = (this.supply.success / this.supply.total) * 100;
    this.supplyFailurePercent = (this.supply.failure / this.supply.total) * 100;
  }

  /* ================= KPI Update ================= */
  updateKPIs(domain: 'trade' | 'loan' | 'supply' | 'all'): void {
    this.selectedDomain = domain;

    const data =
      domain === 'trade' ? this.trade :
      domain === 'loan' ? this.loan :
      domain === 'supply' ? this.supply :
      {
        success: this.trade.success + this.loan.success + this.supply.success,
        failure: this.trade.failure + this.loan.failure + this.supply.failure,
        total: this.trade.total + this.loan.total + this.supply.total,
        slaMet: Math.round(
          (this.trade.slaMet + this.loan.slaMet + this.supply.slaMet) / 3
        ),
        slaBreach: 0
      };

    this.totalControls = data.total;
    this.totalSuccess = data.success;
    this.totalFailure = data.failure;
    this.slaMet = data.slaMet;
    this.slaBreach = 100 - data.slaMet;
  }

  /* ================= Chart ================= */
  private buildChart(): void {
    const labels = ['20-09', '22-09', '24-09', '26-09', '28-09'];

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'SLA Met %',
          data: labels.map(() => this.random(60, 95)),
          borderColor: '#2e7d32',
          backgroundColor: '#2e7d32',
          tension: 0.4
        },
        {
          label: 'SLA Breach %',
          data: labels.map(() => this.random(5, 40)),
          borderColor: '#c62828',
          backgroundColor: '#c62828',
          tension: 0.4
        }
      ]
    };
  }
}