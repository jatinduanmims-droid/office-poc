import { Component, OnInit } from '@angular/core';

/* ================================
   Interfaces
================================ */
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

  /* ================================
     DOMAIN DATA
  ================================ */
  domains: DomainData[] = [];
  selectedDomain!: DomainData;

  /* ================================
     KPI VALUES (animated)
  ================================ */
  animatedKPIs = {
    total: 0,
    success: 0,
    failure: 0,
    slaMet: 0,
    slaBreach: 0
  };

  /* ================================
     FAILED CONTROLS (STATIC MOCK)
  ================================ */
  failedControlsToday: string[] = [
    'LC Maturity follow up (B_GBWW_TT-044)',
    'Documents Checking Deadline Follow up on L/C (B_GBWW_TT-067)',
    'Documents Checking Deadline Follow up on SBLC (B_GBWW_TT-045)'
  ];

  /* ================================
     LIFECYCLE
  ================================ */
  ngOnInit(): void {
    this.generateRandomDomains();          // 🔁 fresh data on every refresh
    this.selectDomain(this.domains[0]);    // default = Trade Controls
  }

  /* ================================
     RANDOM DATA GENERATION
  ================================ */
  generateRandomDomains(): void {
    this.domains = [
      this.buildDomain('Trade Controls'),
      this.buildDomain('Loan Controls'),
      this.buildDomain('Supply Chain Controls')
    ];
  }

  buildDomain(name: string): DomainData {
    const success = this.randomInt(10, 120);
    const failure = this.randomInt(2, 30);
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

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ================================
     DOMAIN SELECTION (CLICK)
  ================================ */
  selectDomain(domain: DomainData): void {
    this.selectedDomain = domain;
    this.animateKPIs(domain);
  }

  isSelected(domain: DomainData): boolean {
    return this.selectedDomain?.name === domain.name;
  }

  /* ================================
     KPI ANIMATION
  ================================ */
  animateKPIs(domain: DomainData): void {
    this.animateValue('total', domain.total);
    this.animateValue('success', domain.success);
    this.animateValue('failure', domain.failure);
    this.animateValue('slaMet', domain.slaMet);
    this.animateValue('slaBreach', domain.slaBreach);
  }

  animateValue(
    key: keyof typeof this.animatedKPIs,
    target: number
  ): void {
    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    const start = this.animatedKPIs[key];
    const increment = (target - start) / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.animatedKPIs[key] = Math.round(start + increment * currentStep);

      if (currentStep >= steps) {
        this.animatedKPIs[key] = target;
        clearInterval(interval);
      }
    }, stepTime);
  }

  /* ================================
     PROGRESS BAR HELPERS
  ================================ */
  successPercent(domain: DomainData): number {
    return Math.round((domain.success / domain.total) * 100);
  }

  failurePercent(domain: DomainData): number {
    return 100 - this.successPercent(domain);
  }
}