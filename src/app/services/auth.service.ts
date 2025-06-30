import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);

    async register(email: string, password: string, airlineData: { name: string, hubIata: string, hubCity: string, logo?: string }) {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(this.firestore, 'users', user.uid), {
            email: user.email,
            airline: airlineData.name,
            hubIata: airlineData.hubIata,
            hubCity: airlineData.hubCity,
            logo: airlineData.logo || 'default-logo.png'
        });
        return user;
    }

    async login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    async googleLogin() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(this.auth, provider);
    }

    async logout() {
        return signOut(this.auth);
    }

    getCurrentUser() {
        return this.auth.currentUser;
    }
}