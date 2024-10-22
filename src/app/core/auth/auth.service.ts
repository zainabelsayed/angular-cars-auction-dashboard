import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(
            `${this.baseUrl}/dashboard/auth/forget-password`,
            {
                email,
                type: 'forgot-password',
            }
        );
    }

    /**
     * Verify OTP
     *
     * @param email
     */
    verifyOTP(email, otp: string): Observable<any> {
        return this._httpClient
            .post(`${this.baseUrl}/dashboard/auth/verify-otp`, {
                email,
                otpCode: otp,
            })
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.data.accessToken;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string, confirmPassword: string): Observable<any> {
        return this._httpClient.post(
            `${this.baseUrl}/dashboard/auth/rest-password`,
            {
                password,
                confirmPassword,
            }
        );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${this.baseUrl}/dashboard/auth/login`, credentials)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.data.accessToken;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.data.user;

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post(`${this.baseUrl}/auth/sign-in-with-token`, {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        return this._httpClient
            .post(`${this.baseUrl}/dashboard/auth/logout`, {})
            .pipe(
                switchMap((response: any) => {
                    // Remove the access token from the local storage
                    localStorage.removeItem('accessToken');

                    // Set the authenticated flag to false
                    this._authenticated = false;
                    return of(response);
                })
            );
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}/auth/sign-up`, user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post(
            `${this.baseUrl}/auth/unlock-session`,
            credentials
        );
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (!!localStorage.getItem('accessToken')) {
            return of(true);
        }

        // Check the access token availability
        if (!localStorage.getItem('accessToken')) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(localStorage.getItem('accessToken'))) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
