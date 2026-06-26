import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: 'Rider' | 'Customer';
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface ChatMessage {
  fromMe: boolean;
  text: string;
  time: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MockDataBannerComponent],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {

  searchTerm = '';
  audienceFilter: 'All' | 'Riders' | 'Customers' = 'All';

  conversations: Conversation[] = [
    { id: 'c1', name: 'Eddie Lobanovskiy', avatar: 'https://i.pravatar.cc/40?img=11', role: 'Rider',    lastMessage: 'On my way to pickup now', lastTime: '2m ago',  unread: 2 },
    { id: 'c2', name: 'Camera Barnlu',     avatar: 'https://i.pravatar.cc/40?img=21', role: 'Customer', lastMessage: 'My order #876364 is delayed', lastTime: '14m ago', unread: 1 },
    { id: 'c3', name: 'Anton Tkacheve',    avatar: 'https://i.pravatar.cc/40?img=13', role: 'Rider',    lastMessage: 'Vehicle battery is low', lastTime: '1h ago',  unread: 0 },
    { id: 'c4', name: 'Linda Mensah',      avatar: 'https://i.pravatar.cc/40?img=26', role: 'Customer', lastMessage: 'Thanks, refund received!', lastTime: '3h ago',  unread: 0 },
    { id: 'c5', name: 'Kwesi Boateng',     avatar: 'https://i.pravatar.cc/40?img=15', role: 'Rider',    lastMessage: 'Requesting maintenance for VH-2204', lastTime: '5h ago',  unread: 0 },
  ];

  selectedConversation: Conversation = this.conversations[0];

  chatHistory: Record<string, ChatMessage[]> = {
    c1: [
      { fromMe: false, text: 'Heading to the pickup point now.', time: '10:02 AM' },
      { fromMe: true,  text: 'Great, customer is waiting at Madina station.', time: '10:03 AM' },
      { fromMe: false, text: 'On my way to pickup now', time: '10:05 AM' },
    ],
    c2: [
      { fromMe: false, text: 'My order #876364 is delayed', time: '09:50 AM' },
      { fromMe: true,  text: 'Apologies for the delay! Checking with the rider now.', time: '09:52 AM' },
    ],
    c3: [
      { fromMe: false, text: 'Vehicle battery is low', time: '08:40 AM' },
      { fromMe: true,  text: 'Noted — please head to the nearest charging point.', time: '08:42 AM' },
    ],
    c4: [
      { fromMe: true,  text: 'Your refund of GHS 45 has been processed.', time: '06:10 AM' },
      { fromMe: false, text: 'Thanks, refund received!', time: '06:20 AM' },
    ],
    c5: [
      { fromMe: false, text: 'Requesting maintenance for VH-2204', time: '05:00 AM' },
    ],
  };

  newMessageText = '';

  showBroadcastModal = false;
  broadcastAudience: 'All Riders' | 'All Customers' | 'Specific Zone' = 'All Riders';
  broadcastText = '';

  get filteredConversations(): Conversation[] {
    return this.conversations.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesAudience = this.audienceFilter === 'All' ||
                               (this.audienceFilter === 'Riders' && c.role === 'Rider') ||
                               (this.audienceFilter === 'Customers' && c.role === 'Customer');
      return matchesSearch && matchesAudience;
    });
  }

  selectConversation(c: Conversation) {
    this.selectedConversation = c;
    c.unread = 0;
  }

  get currentChat(): ChatMessage[] {
    return this.chatHistory[this.selectedConversation.id] || [];
  }

  sendMessage() {
    if (!this.newMessageText.trim()) return;
    if (!this.chatHistory[this.selectedConversation.id]) {
      this.chatHistory[this.selectedConversation.id] = [];
    }
    this.chatHistory[this.selectedConversation.id].push({
      fromMe: true,
      text: this.newMessageText,
      time: 'Just now'
    });
    this.selectedConversation.lastMessage = this.newMessageText;
    this.selectedConversation.lastTime = 'Just now';
    this.newMessageText = '';
  }

  openBroadcast() {
    this.broadcastText = '';
    this.broadcastAudience = 'All Riders';
    this.showBroadcastModal = true;
  }

  closeBroadcast() {
    this.showBroadcastModal = false;
  }

  sendBroadcast() {
    if (this.broadcastText.trim()) {
      this.closeBroadcast();
    }
  }
}