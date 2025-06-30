import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DestinationsComponent } from './components/destinations/destinations.component';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    {path: '', component: LandingPageComponent },
    {path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    {path: 'destinations', component: DestinationsComponent, canActivate: [authGuard] },
    {path: 'calculator', component: CalculatorComponent, canActivate: [authGuard] },
    {path: 'about', component: AboutComponent },
    {path: 'contact', component: ContactComponent },
    {path: '**', redirectTo: '' }
];
