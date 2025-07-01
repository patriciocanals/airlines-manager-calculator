import { Component } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatCardModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';

  constructor(private firestore: Firestore, private snackBar: MatSnackBar) { }

  async submitContact() {
    try {
      await addDoc(collection(this.firestore, 'contacts'), {
        name: this.name,
        email: this.email,
        message: this.message,
        timestamp: new Date()
      });
      this.snackBar.open('Message sent successfully!', 'Close', { duration: 3000 });
      this.name = '';
      this.email = '';
      this.message = '';
    } catch (error) {
      this.snackBar.open('Error sending message. Please try again.', 'Close', { duration: 3000 });
    }
  }
}