import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService, ChatMessage } from './chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  isOpen: boolean = false;
  
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Add welcome message
    this.addMessage('Hello! I\'m your shopping assistant. How can I help you today?', false);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage = this.currentMessage.trim();
    this.addMessage(userMessage, true);
    this.currentMessage = '';
    this.isLoading = true;

    this.chatService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.addMessage(response.response, false);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Chat error:', error);
        this.addMessage('Sorry, I\'m having trouble right now. Please try again.', false);
        this.isLoading = false;
      }
    });
  }

  private addMessage(message: string, isUser: boolean) {
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message,
      isUser: isUser,
      timestamp: new Date()
    };
    this.messages.push(chatMessage);
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
