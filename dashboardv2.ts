import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';

interface DomainData {
  name: string;
  success: number;
  failure: number;
  total: number;
  slaMet: number;
  slaBreach: number;
}

@Component({
  selector: 'app-dashboardv2',
  templateUrl: './dashboardv2.html',
  styleUrls: ['./dashboardv2.css']
})
export class DashboardV2Component implements OnInit {

  /* ================= KPIs ================= */
  domains: DomainData[] = [];
  selectedDomain!: DomainData;

  animatedKPIs = {
    total: 0,
    success: 0,
    failure: 0,
    slaMet: 0,
    slaBreach: 0
  };

  /* ================= Failed Controls ================= */
  failedControlsToday: string[] = [
    'LC Maturity follow up (B_GBWW_TT-044)',
    'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
    'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
  ];

  /* ================= SLA Chart ================= */
  lineChartData!: ChartConfiguration<'line'>['data'];
  lineChartOptions!: ChartOptions<'line'>;

  ngOnInit(): void {
    this.generateRandomDomains();
    this.selectDomain(this.domains[0]);
    this.initSLATrend();
  }

  /* ================= Random Data ================= */
  generateRandomDomains(): void {
    this.domains = [
      this.createDomain('Trade Controls'),
      this.createDomain('Loan Controls'),
      this.createDomain('Supply Chain Controls')
    ];
  }

  createDomain(name: string): DomainData {
    const success = this.random(10, 120);
    const failure = this.random(2, 30);
    const total = success + failure;
    const slaMet = Math.round((success / total) * 100);

    return {
      name,
      success,
      failure,
      total,
      slaMet,
      slaBreach: 100 - slaMet
    };
  }

  random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ================= Domain Click ================= */
  selectDomain(domain: DomainData): void {
    this.selectedDomain = domain;
    this.animateKPIs(domain);
  }

  isSelected(domain: DomainData): boolean {
    return this.selectedDomain?.name === domain.name;
  }

  /* ================= KPI Animation ================= */
  animateKPIs(domain: DomainData): void {
    this.animate('total', domain.total);
    this.animate('success', domain.success);
    this.animate('failure', domain.failure);
    this.animate('slaMet', domain.slaMet);
    this.animate('slaBreach', domain.slaBreach);
  }

  animate(key: keyof typeof this.animatedKPIs, value: number): void {
    const start = this.animatedKPIs[key];
    const steps = 25;
    const increment = (value - start) / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      this.animatedKPIs[key] = Math.round(start + increment * current);
      if (current >= steps) {
        this.animatedKPIs[key] = value;
        clearInterval(timer);
      }
    }, 20);
  }

  /* ================= Progress ================= */
  successPercent(d: DomainData): number {
    return Math.round((d.success / d.total) * 100);
  }

  failurePercent(d: DomainData): number {
    return 100 - this.successPercent(d);
  }

  /* ================= SLA Chart ================= */
  initSLATrend(): void {
    const labels = ['20-09', '21-09', '22-09', '23-09', '24-09'];

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'SLA Met %',
          data: labels.map(() => this.random(60, 95)),
          borderColor: '#2e7d32',
          tension: 0.4
        },
        {
          label: 'SLA Breach %',
          data: labels.map(() => this.random(5, 40)),
          borderColor: '#c62828',
          tension: 0.4
        }
      ]
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100 }
      }
    };
  }
}