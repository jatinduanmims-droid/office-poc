import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

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

  selectedDomain: 'ALL' | 'TRADE' | 'LOAN' | 'SUPPLY' = 'ALL';
  selectedSlaControl = 'Incoming Requests Management';

  domains: Record<string, DomainData> = {};

  totalControls = 0;
  successful = 0;
  unsuccessful = 0;
  slaMet = 0;
  slaBreach = 0;

  slaChartData!: ChartConfiguration<'line'>['data'];
  slaChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100 }
    }
  };

  ngOnInit(): void {
    this.generateRandomData();
    this.applyDomain('ALL');
    this.updateSlaChart();
  }

  generateRandomData() {
    const makeDomain = (): DomainData => {
      const success = this.rand(10, 120);
      const failure = this.rand(1, 25);
      const total = success + failure;
      const slaMet = this.rand(70, 90);
      return {
        success,
        failure,
        total,
        slaMet,
        slaBreach: 100 - slaMet
      };
    };

    this.domains = {
      ALL: makeDomain(),
      TRADE: makeDomain(),
      LOAN: makeDomain(),
      SUPPLY: makeDomain()
    };
  }

  applyDomain(domain: 'ALL' | 'TRADE' | 'LOAN' | 'SUPPLY') {
    this.selectedDomain = domain;
    const d = this.domains[domain];
    this.totalControls = d.total;
    this.successful = d.success;
    this.unsuccessful = d.failure;
    this.slaMet = d.slaMet;
    this.slaBreach = d.slaBreach;
  }

  updateSlaChart() {
    this.slaChartData = {
      labels: ['20-09', '22-09', '24-09', '26-09', '28-09'],
      datasets: [
        {
          label: 'SLA Met %',
          data: this.randomArray(5, 60, 90),
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46,125,50,0.2)',
          tension: 0.4
        },
        {
          label: 'SLA Breach %',
          data: this.randomArray(5, 10, 40),
          borderColor: '#c62828',
          backgroundColor: 'rgba(198,40,40,0.2)',
          tension: 0.4
        }
      ]
    };
  }

  onSlaControlChange() {
    this.updateSlaChart();
  }

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomArray(len: number, min: number, max: number) {
    return Array.from({ length: len }, () => this.rand(min, max));
  }
}