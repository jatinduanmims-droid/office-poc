import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ChatbotDialogComponent } from './components/chatbot-dialog/chatbot-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChatbotDialogComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatSidenavModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @ViewChild('chatSidenav') chatSidenav!: MatSidenav;

  chatOpen = false;
  tradeMenuOpen = false;
  leftPanelOpen = false;

  ngOnInit(): void {}

  toggleLeftPanel(): void {
    this.leftPanelOpen = !this.leftPanelOpen;
  }

  toggleTradeMenu(): void {
    this.tradeMenuOpen = !this.tradeMenuOpen;
  }

  // CHANGE: accept MouseEvent + stopPropagation
  openChatbot(event: MouseEvent): void {
    event.stopPropagation();
    this.chatOpen = true;
    this.chatSidenav.open();
  }

  closeChatBot(): void {
    this.chatOpen = false;
    this.chatSidenav.close();
  }
}