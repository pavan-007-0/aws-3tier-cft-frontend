import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CartDrawerComponent } from './components/cart/cart-drawer.component';
import { Chat } from './chat/chat';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, Chat]
})
export class AppComponent { }
