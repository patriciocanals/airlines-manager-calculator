import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-landing-page',
  imports: [FormsModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  email = '';
  password = '';
  airlineName = '';
  hubIata = '';
  hubCity = '';

  constructor(private authService: AuthService, private router: Router) { }

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async register() {
    try {
      await this.authService.register(this.email, this.password, {
        name: this.airlineName,
        hubIata: this.hubIata,
        hubCity: this.hubCity
      });
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Registration failed', error);
    }
  }

  async googleLogin() {
    try {
      await this.authService.googleLogin();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google login failed', error);
    }
  }
}
