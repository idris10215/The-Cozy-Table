import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Added and maintained by springbaord mentor
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
