import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatbotService } from '../../services/chatbot.service';
import { MatIconModule } from '@angular/material/icon';
import { EmailService } from '../../services/email.service';

export interface ChatMsg {
  text: string;
  isUser: boolean;
}

@Component({
  standalone: true,
  selector: 'app-chatbot-dialog',
  templateUrl: './chatbot-dialog.component.html',
  styleUrls: ['./chatbot-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class ChatbotDialogComponent implements AfterViewInit {

  question = '';
  answer: any = null;

  @Output() closePanel = new EventEmitter<void>();

  chatMessages: ChatMsg[] = [];

  // Resizable panel state
  panelWidth = 380;
  panelHeight = 620;
  private readonly baseWidth = 380;
  private readonly baseHeight = 620;
  private readonly minWidth = 320;
  private readonly minHeight = 420;
  private readonly maxWidthRatio = 0.95;
  private readonly maxHeightRatio = 0.95;

  resizing = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startWidth = 380;
  private startHeight = 620;

  constructor(
    private chatbotService: ChatbotService,
    private emailSrv: EmailService,
    private hostRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    this.applyContainerSize();
  }

  /** Start resizing from any non-input part of the chatbot panel */
  onResizeStart(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('textarea, input, button, a, mat-icon')) {
      return;
    }

    this.resizing = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.startWidth = this.panelWidth;
    this.startHeight = this.panelHeight;

    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMove(event: MouseEvent): void {
    if (!this.resizing) {
      return;
    }

    const maxWidth = Math.floor(window.innerWidth * this.maxWidthRatio);
    const maxHeight = Math.floor(window.innerHeight * this.maxHeightRatio);

    const nextWidth = this.startWidth + (event.clientX - this.dragStartX);
    const nextHeight = this.startHeight + (event.clientY - this.dragStartY);

    this.panelWidth = this.clamp(nextWidth, this.minWidth, maxWidth);
    this.panelHeight = this.clamp(nextHeight, this.minHeight, maxHeight);

    this.applyContainerSize();
  }

  @HostListener('document:mouseup')
  onResizeEnd(): void {
    this.resizing = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const maxWidth = Math.floor(window.innerWidth * this.maxWidthRatio);
    const maxHeight = Math.floor(window.innerHeight * this.maxHeightRatio);

    this.panelWidth = Math.min(this.panelWidth, maxWidth);
    this.panelHeight = Math.min(this.panelHeight, maxHeight);

    this.applyContainerSize();
  }

  sendQuestion(): void {
    if (!this.question.trim()) {
      return;
    }

    this.chatMessages.push({
      text: this.question,
      isUser: true
    });

    this.chatbotService.ask_llm(this.question).subscribe({
      next: (response) => {
        let answerText = '';

        if (response && typeof response === 'object') {
          if (Array.isArray((response as any).row_ids)) {
            this.emailSrv.emitRowIdFilter((response as any).row_ids);
          }

          answerText = (response as any).summary ?? JSON.stringify(response);
        } else {
          answerText = String(response);
        }

        this.chatMessages.push({
          text: answerText,
          isUser: false
        });

        this.question = '';
      },
      error: (err) => {
        console.error('Error retrieving data:', err);
      }
    });
  }

  onCloseClicked(): void {
    this.closePanel.emit();
  }

  get panelScale(): number {
    const sx = this.panelWidth / this.baseWidth;
    const sy = this.panelHeight / this.baseHeight;
    return Math.max(0.6, Math.min(sx, sy));
  }

  get inverseScaleWidthPercent(): number {
    return 100 / this.panelScale;
  }

  get inverseScaleHeightPercent(): number {
    return 100 / this.panelScale;
  }

  private applyContainerSize(): void {
    const host = this.hostRef.nativeElement;
    const drawer = host.closest('.mat-drawer, .mat-sidenav') as HTMLElement | null;

    if (drawer) {
      drawer.style.width = `${this.panelWidth}px`;
      drawer.style.maxWidth = '95vw';
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
