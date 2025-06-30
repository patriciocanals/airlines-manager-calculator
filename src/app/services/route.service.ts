import { inject, Injectable } from "@angular/core";
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "@angular/fire/firestore";
import { Auth } from "@angular/fire/auth";
import { Route } from "../models/route.model";

@Injectable({
    providedIn: 'root'
})
export class RouteService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);

    async addRoute(route: Route) {
        const user = this.auth.currentUser;
        if (user) {
            const routesCollection = collection(this.firestore, `users/${user.uid}/routes`);
            return addDoc(routesCollection, route);
        }
        throw new Error('User not authenticated');
    }

    async getRoutes() {
        const user = this.auth.currentUser;
        if (user) {
            const routesCollection = collection(this.firestore, `users/${user.uid}/routes`);
            const querySnapshot = await getDocs(routesCollection);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
        }
        return [];
    }

    async updateRoute(routeId: string, route: Partial<Route>) {
        const user = this.auth.currentUser;
        if (user) {
            const routeDoc = doc(this.firestore, `users/${user.uid}/routes`, routeId);
            return updateDoc(routeDoc, route);
        }
        throw new Error('User not authenticated');
    }

    async deleteRoute(routeId: string) {
        const user = this.auth.currentUser;
        if (user) {
            const routeDoc = doc(this.firestore, `users/${user.uid}/routes`, routeId);
            return deleteDoc(routeDoc);
        }
        throw new Error('User not authenticated');
    }
}