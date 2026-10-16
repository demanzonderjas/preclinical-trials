<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
     */
    public function __invoke(Request $request)
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended('/dashboard')
                    : Inertia::render('auth/verify-email', [
                        'email' => $request->user()->email,
                        'sent' => $request->session()->get('status') === 'verification-link-sent',
                    ]);
    }
}
