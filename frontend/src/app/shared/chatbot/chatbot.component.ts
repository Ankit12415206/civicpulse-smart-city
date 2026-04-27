import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService } from '../../services/chatbot.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  quickActions?: string[];
  action?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Chat Button -->
    <button class="chat-fab" *ngIf="!isOpen" (click)="open()" title="Chat with CivicBot">
      <span class="fab-icon">🤖</span>
      <span class="fab-pulse"></span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window" *ngIf="isOpen" [class.chat-closing]="isClosing">
      <div class="chat-header">
        <div class="chat-header-left">
          <span class="bot-avatar">🤖</span>
          <div>
            <span class="bot-name">CivicBot</span>
            <span class="bot-status">Online — Ready to help</span>
          </div>
        </div>
        <button class="close-btn" (click)="close()">✕</button>
      </div>

      <div class="chat-body" #chatBody>
        <div *ngFor="let msg of messages" class="msg-row"
          [class.msg-user]="msg.sender === 'user'"
          [class.msg-bot]="msg.sender === 'bot'">
          <div class="msg-bubble" [innerHTML]="formatMessage(msg.text)"></div>
          <div class="msg-time">{{ msg.timestamp | date:'shortTime' }}</div>

          <!-- Quick Actions -->
          <div class="quick-actions" *ngIf="msg.sender === 'bot' && msg.quickActions?.length">
            <button *ngFor="let qa of msg.quickActions"
              class="qa-btn" (click)="handleQuickAction(qa)">
              {{ qa }}
            </button>
          </div>
        </div>

        <div *ngIf="typing" class="msg-row msg-bot">
          <div class="msg-bubble typing-bubble">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <input
          [(ngModel)]="inputText"
          (keydown.enter)="send()"
          placeholder="Type your message..."
          class="chat-input"
          [disabled]="typing"
        />
        <button class="send-btn" (click)="send()" [disabled]="!inputText.trim() || typing">
          ➤
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Floating Action Button */
    .chat-fab { position:fixed; bottom:24px; right:24px; z-index:9999;
      width:60px; height:60px; border-radius:50%;
      background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 6px 24px rgba(14,165,160,0.4);
      transition:transform 0.2s; }
    .chat-fab:hover { transform:scale(1.08); }
    .fab-icon { font-size:28px; }
    .fab-pulse { position:absolute; inset:0; border-radius:50%;
      border:3px solid #0EA5A0; animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); }
      50% { opacity:0; transform:scale(1.4); } }

    /* Chat Window */
    .chat-window { position:fixed; bottom:24px; right:24px; z-index:10000;
      width:380px; max-height:560px; border-radius:20px;
      background:var(--bg-card2,#1a2840);
      border:1px solid var(--border,rgba(255,255,255,0.1));
      box-shadow:0 16px 48px rgba(0,0,0,0.5);
      display:flex; flex-direction:column;
      animation:slideUp 0.3s ease-out; overflow:hidden; }
    .chat-closing { animation:slideDown 0.2s ease-in forwards; }
    @keyframes slideUp { from { opacity:0; transform:translateY(30px); }
      to { opacity:1; transform:translateY(0); } }
    @keyframes slideDown { from { opacity:1; transform:translateY(0); }
      to { opacity:0; transform:translateY(30px); } }

    /* Header */
    .chat-header { padding:14px 18px; display:flex; align-items:center;
      justify-content:space-between;
      background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      border-radius:20px 20px 0 0; }
    .chat-header-left { display:flex; align-items:center; gap:10px; }
    .bot-avatar { font-size:28px; }
    .bot-name { display:block; font-size:15px; font-weight:700; color:#fff; }
    .bot-status { display:block; font-size:10px; color:rgba(255,255,255,0.7); }
    .close-btn { background:rgba(255,255,255,0.2); border:none; color:#fff;
      width:28px; height:28px; border-radius:50%; cursor:pointer;
      font-size:14px; display:flex; align-items:center; justify-content:center; }
    .close-btn:hover { background:rgba(255,255,255,0.3); }

    /* Body */
    .chat-body { flex:1; overflow-y:auto; padding:16px;
      max-height:380px; scroll-behavior:smooth; }
    .msg-row { margin-bottom:14px; display:flex; flex-direction:column; }
    .msg-user { align-items:flex-end; }
    .msg-bot { align-items:flex-start; }
    .msg-bubble { max-width:85%; padding:10px 14px; border-radius:14px;
      font-size:13px; line-height:1.6; word-wrap:break-word; }
    .msg-user .msg-bubble { background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      color:#fff; border-bottom-right-radius:4px; }
    .msg-bot .msg-bubble { background:var(--bg-main,#0f1923);
      color:var(--text,#e2e8f0); border-bottom-left-radius:4px;
      border:1px solid var(--border,rgba(255,255,255,0.08)); }
    .msg-time { font-size:9px; color:var(--text3,#64748b); margin-top:3px;
      padding:0 4px; }

    /* Quick Actions */
    .quick-actions { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
    .qa-btn { padding:5px 12px; font-size:11px; font-weight:600;
      background:rgba(14,165,160,0.12); color:var(--teal,#0EA5A0);
      border:1px solid rgba(14,165,160,0.3); border-radius:20px;
      cursor:pointer; transition:all 0.2s; }
    .qa-btn:hover { background:rgba(14,165,160,0.25); transform:translateY(-1px); }

    /* Typing Indicator */
    .typing-bubble { display:flex; align-items:center; gap:4px; padding:12px 18px; }
    .dot { width:7px; height:7px; border-radius:50%; background:var(--text3,#64748b);
      animation:bounce 1.4s infinite; }
    .dot:nth-child(2) { animation-delay:0.2s; }
    .dot:nth-child(3) { animation-delay:0.4s; }
    @keyframes bounce { 0%,60%,100% { transform:translateY(0); }
      30% { transform:translateY(-6px); } }

    /* Footer */
    .chat-footer { padding:12px; display:flex; gap:8px;
      border-top:1px solid var(--border,rgba(255,255,255,0.08)); }
    .chat-input { flex:1; padding:10px 14px;
      background:var(--bg-main,#0f1923);
      border:1px solid var(--border,rgba(255,255,255,0.1));
      border-radius:24px; font-size:13px;
      color:var(--text,#e2e8f0); outline:none; }
    .chat-input:focus { border-color:var(--teal,#0EA5A0); }
    .chat-input::placeholder { color:var(--text3,#64748b); }
    .send-btn { width:40px; height:40px; border-radius:50%;
      background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      border:none; color:#fff; font-size:16px; cursor:pointer;
      display:flex; align-items:center; justify-content:center; }
    .send-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .send-btn:hover:not(:disabled) { transform:scale(1.05); }

    /* Scrollbar */
    .chat-body::-webkit-scrollbar { width:4px; }
    .chat-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }

    @media(max-width:500px) {
      .chat-window { width:calc(100vw - 16px); right:8px; bottom:8px;
        max-height:calc(100vh - 16px); }
      .chat-fab { bottom:16px; right:16px; }
    }
  `]
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  isOpen = false;
  isClosing = false;
  inputText = '';
  typing = false;
  messages: ChatMessage[] = [];

  constructor(
    private chatService: ChatbotService,
    private router: Router
  ) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  open() {
    this.isOpen = true;
    this.isClosing = false;
    if (this.messages.length === 0) {
      this.messages.push({
        text: "👋 Hi there! I'm **CivicBot**, your smart city assistant.\n\nHow can I help you today?",
        sender: 'bot',
        quickActions: ['Check Status', 'Submit Complaint', 'FAQs', 'My Summary'],
        timestamp: new Date()
      });
    }
  }

  close() {
    this.isClosing = true;
    setTimeout(() => {
      this.isOpen = false;
      this.isClosing = false;
    }, 200);
  }

  send() {
    const text = this.inputText.trim();
    if (!text) return;

    this.messages.push({
      text,
      sender: 'user',
      timestamp: new Date()
    });
    this.inputText = '';
    this.typing = true;

    this.chatService.sendMessage(text).subscribe({
      next: (res) => {
        this.typing = false;
        this.messages.push({
          text: res.reply,
          sender: 'bot',
          quickActions: res.quickActions,
          action: res.action,
          timestamp: new Date()
        });

        // Handle navigation actions
        if (res.action && res.action.startsWith('navigate:')) {
          const route = res.action.replace('navigate:', '');
          setTimeout(() => this.router.navigate([route]), 1500);
        }
      },
      error: () => {
        this.typing = false;
        this.messages.push({
          text: "⚠️ Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'bot',
          quickActions: ['Try Again'],
          timestamp: new Date()
        });
      }
    });
  }

  handleQuickAction(action: string) {
    const actionMap: Record<string, string> = {
      'Check Status': 'check status',
      'Submit Complaint': 'submit complaint',
      'Go to Submit': 'submit complaint',
      'Submit New': 'submit complaint',
      'FAQs': 'faq',
      'Categories': 'categories',
      'Categories Info': 'categories',
      'My Summary': 'summary',
      'Back to Home': 'hello',
      'New Question': 'hello',
      'My Grievances': 'check status',
      'Try Again': 'hello'
    };

    this.inputText = actionMap[action] || action;
    this.send();
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom() {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
