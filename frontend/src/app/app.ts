import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ChatButton } from './components/chat-button/chat-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ChatButton],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('Jennisson Realty');
}
