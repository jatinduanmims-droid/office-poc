import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';

import { ChatbotDialogComponent } from './components/chatbot-dialog/chatbot-dialog.component';
import { EmailService } from './services/email.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatSidenavModule,
    ChatbotDialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @ViewChild('chatSidenav') private chatSidenav!: MatSidenav;

  leftPanelOpen = true;
  tradeMenuOpen = false;
  chatOpen = false;

  constructor(
    private emailService: EmailService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  toggleLeftPanel(): void {
    this.leftPanelOpen = !this.leftPanelOpen;
  }

  toggleTradeMenu(): void {
    this.tradeMenuOpen = !this.tradeMenuOpen;
  }

  openChatbot(): void {
    this.chatOpen = true;
    this.chatSidenav?.open();
  }

  closeChatBot(): void {
    this.chatOpen = false;
    this.chatSidenav?.close();
  }
}
