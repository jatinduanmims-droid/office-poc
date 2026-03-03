import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../services/email.service';
import { EmailDetail } from '../models/email-detail.model';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-control1-v2',
  standalone: true,
  imports: [CommonModule, NgChartsModule, TableModule],
  templateUrl: './control1-v2.component.html',
  styleUrls: ['./control1-v2.component.scss']
})
export class Control1V2Component implements OnInit {

  // =========================
  // DEMO STABLE DATE
  // =========================
  readonly targetDate: Date = new Date('2025-09-26');

  // =========================
  // DATA
  // =========================
  batchEmails: EmailDetail[] = [];
  displayedEmails: EmailDetail[] = [];
  activeFilter: string | null = null;
  loading = false;

  // =========================
  // KPI COUNTERS
  // =========================
  totalToday = 0;
  urgentToday = 0;
  amendmentsToday = 0;
  issuanceToday = 0;
  cancellationToday = 0;
  undefinedToday = 0;

  due24 = 0;
  due48 = 0;
  overdue = 0;

  slaMet = 0;
  slaBreach = 0;
  slaPercentage = 0;

  // =========================
  // CHARTS
  // =========================
  slaLineData!: ChartData<'bar'>;
  slaLineOptions!: ChartOptions<'bar'>;

  dueBarData!: ChartData<'bar'>;
  dueBarOptions!: ChartOptions<'bar'>;

  // =========================
  // TABLE CONFIG
  // =========================
  cols = [
    { field: 'SENDER', header: 'Sender' },
    { field: 'OPERATION', header: 'Operation' },
    { field: 'EMAIL_RECEIVEDTIME_FMT', header: 'Received On' },
    { field: 'EMAIL_CLASSIFICATION', header: 'Classification' },
    { field: 'LC_REFERENCE_NUMBER', header: 'LC Ref' },
    { field: 'APPROVEDATE_FMT', header: 'Approval Date' },
    { field: 'SLA_DATE_FMT', header: 'SLA Date' },
    { field: 'SLA_MET', header: 'SLA Met' }
  ];

  constructor(private emailSrv: EmailService) {}

  ngOnInit(): void {
    this.loadBatchEmails();
  }

  // =========================
  // LOAD DATA
  // =========================
  private loadBatchEmails(): void {
    this.loading = true;

    this.emailSrv.getBatchEmails().subscribe({
      next: (data: EmailDetail[]) => {

        this.batchEmails = data.map(e => ({
          ...e,
          SLA_DATE: new Date(e.SLA_DATE),
          EMAIL_RECEIVEDTIME: new Date(e.EMAIL_RECEIVEDTIME),
          APPROVEDATE: e.APPROVEDATE ? new Date(e.APPROVEDATE) : undefined,
          SLA_DATE_FMT: this.formatDate(e.SLA_DATE),
          EMAIL_RECEIVEDTIME_FMT: this.formatDate(e.EMAIL_RECEIVEDTIME),
          APPROVEDATE_FMT: e.APPROVEDATE ? this.formatDate(e.APPROVEDATE) : ''
        }));

        this.displayedEmails = [...this.batchEmails];

        this.calculateKpis();
        this.buildCharts();

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // =========================
  // KPI CALCULATIONS
  // =========================
  private calculateKpis(): void {

    const target = this.targetDate.toDateString();

    this.totalToday = this.batchEmails.filter(e =>
      new Date(e.EMAIL_RECEIVEDTIME).toDateString() === target
    ).length;

    this.urgentToday = this.batchEmails.filter(e =>
      new Date(e.EMAIL_RECEIVEDTIME).toDateString() === target &&
      e.EMAIL_CLASSIFICATION === 'Urgent'
    ).length;

    this.amendmentsToday = this.batchEmails.filter(e =>
      new Date(e.EMAIL_RECEIVEDTIME).toDateString() === target &&
      e.OPERATION?.toLowerCase().includes('amend')
    ).length;

    this.issuanceToday = this.batchEmails.filter(e =>
      new Date(e.EMAIL_RECEIVEDTIME).toDateString() === target &&
      e.OPERATION?.toLowerCase().includes('issu')
    ).length;

    this.cancellationToday = this.batchEmails.filter(e =>
      new Date(e.EMAIL_RECEIVEDTIME).toDateString() === target &&
      e.OPERATION?.toLowerCase().includes('cancel')
    ).length;

    this.undefinedToday =
      this.totalToday -
      this.amendmentsToday -
      this.issuanceToday -
      this.cancellationToday;

    const d24 = new Date(this.targetDate);
    d24.setDate(d24.getDate() + 1);

    const d48 = new Date(this.targetDate);
    d48.setDate(d48.getDate() + 2);

    this.due24 = this.batchEmails.filter(e =>
      new Date(e.SLA_DATE).toDateString() === d24.toDateString()
    ).length;

    this.due48 = this.batchEmails.filter(e =>
      new Date(e.SLA_DATE).toDateString() === d48.toDateString()
    ).length;

    this.overdue = this.batchEmails.filter(e =>
      new Date(e.SLA_DATE) < this.targetDate &&
      e.SLA_MET !== 'Y'
    ).length;

    this.slaMet = this.batchEmails.filter(e => e.SLA_MET === 'Y').length;
    this.slaBreach = this.batchEmails.filter(e => e.SLA_MET === 'N').length;

    const totalSla = this.slaMet + this.slaBreach;
    this.slaPercentage = totalSla
      ? Math.round((this.slaMet / totalSla) * 100)
      : 0;
  }

  // =========================
  // CHART BUILDERS
  // =========================
  private buildCharts(): void {

    this.slaLineData = {
      labels: ['SLA Met', 'SLA Breach'],
      datasets: [
        {
          data: [this.slaMet, this.slaBreach],
          label: 'SLA Status'
        }
      ]
    };

    this.slaLineOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    this.dueBarData = {
      labels: ['Due 24h', 'Due 48h', 'Overdue'],
      datasets: [
        {
          data: [this.due24, this.due48, this.overdue],
          label: 'Requests'
        }
      ]
    };

    this.dueBarOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  // =========================
  // FILTERING
  // =========================
  onFilter(type: string): void {
    this.activeFilter = type;
  }

  clearFilter(): void {
    this.activeFilter = null;
    this.displayedEmails = [...this.batchEmails];
  }

  private formatDate(value: string | Date): string {
    return new Date(value).toLocaleDateString('en-GB');
  }
}