import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function timeRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const time = control.value;
    const [hours, minutes] = time.split(':').map(Number);

    if (hours >= 10 && hours <= 22) {
      return null; // valid time
    }
    return { 'timeRange': true }; // invalid time
  };
}
