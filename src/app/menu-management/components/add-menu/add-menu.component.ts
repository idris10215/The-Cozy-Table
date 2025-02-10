import { Component, HostBinding, Input } from '@angular/core'; // Add Input to the import statement
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-menu',
  standalone: true,
  imports: [FormsModule, CommonModule], // Import the entire FormsModule
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.css'],
})
export class AddMenuComponent {
  menu: User = new User();

  constructor(private userService: UserService, private location: Location) {}

  goBack() {
    this.location.back();
  }

  @HostBinding('class.night')
  isNightMode: boolean = false; // Bind 'night' class to the host element dynamically

  // Toggle day/night mode
  toggleMode() {
    this.isNightMode = !this.isNightMode;

    const body = document.body;
    if (this.isNightMode) {
      body.classList.remove('day'); // Remove day class
      body.classList.add('night'); // Add night class
    } else {
      body.classList.remove('night'); // Remove night class
      body.classList.add('day'); // Add day class
    }
  }

  @Input() imageUrl: string = ''; // Input for the image URL
  imagePreview: string | null = null; // For displaying the image preview

  // Update the image preview based on the entered URL
  onImageUrlChange(): void {
    if (this.imageUrl) {
      this.imagePreview = this.imageUrl; // Update the preview with the URL
    } else {
      this.imagePreview = null; // Clear the preview if the URL is empty
    }
  }

  // Submit the form
  onSubmit(form: any) {
    if (form.valid) {
      this.menu.image = this.imageUrl; // Assign the image URL to the menu object
      this.userService.addMenuItem(this.menu).subscribe({
        next: () => {
          alert('Menu item added successfully!');
          form.reset(); // Reset the form
          this.menu = new User(0, '', '', 0, '', true, ''); // Reset menu object
          this.imagePreview = null; // Reset the image preview
          this.imageUrl = ''; // Clear the image URL
        },
        error: (err) => {
          console.error(err);
          alert('Failed to add menu item.');
        },
      });
    }
  }
}
