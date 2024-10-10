import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { OtpInputComponent } from 'app/components/otp-input/otp-input.component';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-confirmation-required',
    templateUrl: './confirmation-required.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [RouterLink, OtpInputComponent, FuseAlertComponent],
})
export class AuthConfirmationRequiredComponent {
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {}
    onOtpComplete(otp: string) {
        // Send OTP to the server for verification
        this.verifyOtp(otp);
    }

    verifyOtp(otp: string) {
        // verify otp
        const email = localStorage.getItem('email');
        this._authService.verifyOTP(email, otp).subscribe(
            (response) => {
                this._router.navigate(['/reset-password']);
            },
            (response) => {
                // Set the alert
                this.showAlert = true;
                this.alert = {
                    type: 'error',
                    message:
                        'Invalid OTP. Please check your email and try again.',
                };
            }
        );
    }
}
