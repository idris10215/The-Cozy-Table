import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Route, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.formbuilder.group({
      identifier: [''], // Single field for email or mobile number
      Password: ['']
    });
  }

  login() {
    this.http.get<any>("assets/db.json").subscribe(
      (res) => {
        const user = res.users.find((a: any) => {
          const identifier = this.loginForm.value.identifier;
          return (a.EmailAddress === identifier || a.MobileNumber.toString() === identifier) && a.Password === this.loginForm.value.Password;
        });
        if (user) {
          localStorage.setItem('userEmail', user.EmailAddress);
          localStorage.setItem('userName', user.FullName);
          localStorage.setItem('userRole', user.Role);
          localStorage.setItem('userId', user.id); // Save User ID
          this.loginForm.reset();
          this.router.navigate(['admin-dashboard']);
        } else {
          alert('User not found!');
        }
      },
      (err) => {
        alert('Something went wrong');
      }
    );
  }
}