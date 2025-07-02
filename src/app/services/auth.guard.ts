import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return new Observable<boolean>(observer => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            console.log('AuthGuard: User authenticated?', !!user, 'UID:', user?.uid);
            if (user) {
                observer.next(true);
            } else {
                console.log('AuthGuard: Redirecting to /login');
                router.navigate(['/login']);
                observer.next(false);
            }
            observer.complete();
        });
        return () => unsubscribe();
    }).pipe(take(1));
};