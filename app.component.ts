import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { EmailService } from './services/email.service';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';

// Chatbot component
import { ChatbotDialogComponent } from './components/chatbot-dialog/chatbot-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ChatbotDialogComponent,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatSidenavModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],   // ← correct property
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @ViewChild('chatSidenav') private chatSidenav!: MatSidenav;

  menuItems: MenuItem[] = [];

  chatOpen: boolean = false;
  tradeMenuOpen: boolean = false;
  leftPanelOpen: boolean = true;

  constructor(
    private emailService: EmailService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.menuItems = [
      { label: '', icon: 'pi pi-home', routerLink: ['/emails'] },
      {
        label: 'Trade Controls',
        styleClass: 'trade-controls-box',
        items: [
          { label: 'Incoming Requests Management Control', routerLink: ['/dashboard'] },
          { label: 'L/C Maturity follow up', routerLink: ['/lc-maturity'] }
        ]
      }
    ];
  }

  toggleLeftPanel(): void {
    this.leftPanelOpen = !this.leftPanelOpen;
  }

  toggleTradeMenu(): void {
    this.tradeMenuOpen = !this.tradeMenuOpen;
  }

  openChatbot(): void {
    this.chatOpen = true;
    this.chatSidenav.open();
  }

  closeChatBot(): void {
    this.chatOpen = false;
    this.chatSidenav.close();
  }
}
