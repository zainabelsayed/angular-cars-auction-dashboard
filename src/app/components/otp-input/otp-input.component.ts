import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-otp-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './otp-input.component.html',
    styleUrl: './otp-input.component.scss',
})
export class OtpInputComponent {
    @Input() otpLength: number = 4; // length of the OTP
    @Output() otpComplete = new EventEmitter<string>();

    otpArray = new Array(this.otpLength);
    otp: string[] = new Array(this.otpLength).fill('');

    // Focus on the next input after entering a value
    onInputChange(event: any, index: number) {
        const input = event.target;
        const value = input.value;
        this.otp.splice(index, 1, value);
        // Move to the next input field if a digit is entered
        if (value && index < this.otpLength - 1) {
            const nextInput = input.nextElementSibling;
            if (nextInput) {
                nextInput.focus();
            }
        }

        // Emit OTP if fully entered
        if (this.otp.every((digit) => digit !== '')) {
            this.emitOtp();
        }
    }

    // Handle keyboard events, such as backspace
    onKeyDown(event: any, index: number) {
        const input = event.target;

        // Move to the previous input field on backspace
        if (event.key === 'Backspace' && index > 0 && !input.value) {
            const prevInput = input.previousElementSibling;
            if (prevInput) {
                prevInput.focus();
            }
        }
    }

    // Handle pasting an OTP
    onPaste(event: ClipboardEvent) {
        const pastedData = event.clipboardData?.getData('text');
        if (pastedData && pastedData.length === this.otpLength) {
            this.otp = pastedData.split('');
            this.emitOtp();
        }
    }

    // Emit the OTP when it's complete
    emitOtp() {
        const otpValue = this.otp.join('');
        this.otpComplete.emit(otpValue);
    }

    isNumberKey(event: KeyboardEvent): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return false;
        }
        return true;
    }
}
