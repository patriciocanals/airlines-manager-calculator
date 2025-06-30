import { Component, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from '../../services/auth.service';
import { getDoc, doc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, MatIconModule, MatButtonModule, NavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  airlineName = '';
  airlineLogo = '';

  constructor(private authService: AuthService, private firestore: Firestore, private router: Router) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      const data = userDoc.data();
      this.airlineName = data?.['airline'] || 'MyAirline';
      this.airlineLogo = data?.['logo'] || 'assets/images/default-logo.png';
    }
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
