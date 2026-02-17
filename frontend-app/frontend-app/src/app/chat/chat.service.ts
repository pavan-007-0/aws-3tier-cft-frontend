import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/chatbot';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, userId?: string): Observable<ChatResponse> {
    const payload = {
      message: message,
      user_id: userId
    };
    
    // Faster timeout for better UX
    return this.http.post<ChatResponse>(`${this.apiUrl}/message`, payload, {
      timeout: 5000 // 5 second timeout instead of default 30s
    });
  }

  getChatHistory(userId: string): Observable<{history: any[]}> {
    return this.http.get<{history: any[]}>(`${this.apiUrl}/history?user_id=${userId}`);
  }
}