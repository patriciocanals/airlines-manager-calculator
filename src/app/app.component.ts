import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Airlines Manager Calculator';

  constructor(private auth: Auth, private router: Router) { }

  logout() {
    this.auth.signOut().then(() => {
      console.log('App: Logged out, redirecting to /login');
      this.router.navigate(['/login']);
    }).catch(err => {
      console.error('App: Logout failed:', err);
    });
  }
}