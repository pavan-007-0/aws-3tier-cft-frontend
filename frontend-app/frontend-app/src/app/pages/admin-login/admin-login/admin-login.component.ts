import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  login(): void {
    this.error = '';
    this.authService.login({ email: this.username, password: this.password }).subscribe({
      next: response => {
        if (response.success && response.user?.role === 'admin') {
          localStorage.setItem('adminLoggedIn', 'true');
          this.router.navigate(['/admin']);
        } else {
          this.error = 'This account does not have administrator access';
        }
      },
      error: error => {
        this.error = error?.message || 'Invalid email or password';
      }
    });
  }
}
