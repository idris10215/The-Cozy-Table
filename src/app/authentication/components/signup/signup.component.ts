import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      FullName: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$')]],
      MobileNumber: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      EmailAddress: ['', [Validators.required, Validators.email]],
      Password: ['', Validators.required]
    });
  }

  // Getters for easy access in the template
  get fullName() { return this.signupForm.get('FullName'); }
  get mobileNumber() { return this.signupForm.get('MobileNumber'); }
  get emailAddress() { return this.signupForm.get('EmailAddress'); }
  get password() { return this.signupForm.get('Password'); }

  // Form submission handling
  onSubmit(): void {
    if (this.signupForm.invalid) {
      alert('Please fill all the fields correctly.');
      return;
    }

    const userData = {
      ...this.signupForm.value,
      Role: 'Customer'
    };

    this.http.post('http://localhost:3000/users', userData)
      .subscribe(
        () => {
          alert('Signup Successful!');
          this.signupForm.reset();
          this.router.navigate(['/login']);
        },
        () => alert('Something went wrong. Please try again.')
      );
  }

  cancel(): void {
    this.router.navigate(['/login']);
  }
}
