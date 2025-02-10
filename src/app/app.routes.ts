import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './orders/components/cart/cart.component';
import { OrderSummaryComponent } from './orders/components/order-summary/order-summary.component';
import { OrderListComponent } from './orders/components/order-list/order-list.component';
import { MenuPageComponent } from './menu-management/components/menu-page/menu-page.component';
import { AddMenuComponent } from './menu-management/components/add-menu/add-menu.component';
import { MenuListComponent } from './menu-management/components/menu-list/menu-list.component';
import { ComponentFeedbackComponent } from './feedback/components/component-feedback/ComponentFeedbackComponent';
import { UserListComponent } from './feedback/components/user-list/user-list.component';
import { LoginComponent } from './authentication/components/login/login.component';
import { SignupComponent } from './authentication/components/signup/signup.component';
import { ReservationFormComponent } from './reservations/components/reservation-form/reservation-form.component';
import { ReservationListComponent } from './reservations/components/reservation-list/reservation-list.component';
import { ProfileComponent } from './authentication/components/profile/profile.component';
import { AdminDashboardComponent } from './dashboard/components/admin-dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './dashboard/components/customer-dashboard/customer-dashboard.component';
import { MasterComponent } from './core/master/master.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NgModule } from '@angular/core';
import { AdminGuard } from './core/guards/admin.guard';
import { UserGuard } from './core/guards/user.guard';
import { LandingComponent } from './core/landing/landing.component';
import { FirstComponent } from './core/landing/first/first.component';
import { Part2Component } from './core/landing/part2/part2.component';
import { ThirdComponent } from './core/landing/third/third.component';


export const routes: Routes = [
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    // Public routes
    {path: 'landing', component: LandingComponent},
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: '', component: MasterComponent},

  // Protected routes under 'MasterComponent'
  {
    path: '',component: MasterComponent,
    children: [
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'reservation-list', component: ReservationListComponent, canActivate: [AuthGuard] },
      { path: 'edit/:id', component: ReservationFormComponent, canActivate: [AuthGuard] },
      { path: 'add', component: ReservationFormComponent, canActivate: [AuthGuard] },
      { path: 'menu', component: MenuPageComponent, canActivate: [AuthGuard] },
      { path: 'menu-add', component: AddMenuComponent, canActivate: [AuthGuard , AdminGuard] },
      { path: 'menu-list', component: MenuListComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [AuthGuard, UserGuard] },
      { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
      { path: 'order-summary', component: OrderSummaryComponent, canActivate: [AuthGuard] },
      { path: 'order-list', component: OrderListComponent ,canActivate: [AuthGuard] },
      { path: 'feedback', component: ComponentFeedbackComponent, canActivate: [AuthGuard, UserGuard] },
      { path: 'feedback-list', component: UserListComponent, canActivate: [AuthGuard] },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}