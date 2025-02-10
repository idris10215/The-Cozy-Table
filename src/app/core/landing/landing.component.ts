import { Component } from '@angular/core';
import { FirstComponent } from './first/first.component';
import { Part2Component } from './part2/part2.component';
import { ThirdComponent } from './third/third.component';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FirstComponent, Part2Component, ThirdComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
