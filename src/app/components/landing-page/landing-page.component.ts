import { Component } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <button mat-raised-button color="primary" (click)="signInWithGoogle()" aria-label="Sign in with Google">Sign in with Google</button>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
  `
})
export class LoginComponent {
  constructor(private auth: Auth, private router: Router) { }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      console.log('Login: Google login successful, user:', result.user.uid);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login: Google login failed:', error);
    }
  }
}