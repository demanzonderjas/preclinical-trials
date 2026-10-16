<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    /**
     * The A2 "reset your password" page.
     */
    public function create(Request $request)
    {
        return Inertia::render('auth/forgot-password', [
            'sentTo' => $request->session()->get('reset_link_sent_to'),
            'sentAt' => $request->session()->get('reset_link_sent_at'),
        ]);
    }

    /**
     * Sends a reset link. The answer is the same whether or not the address has an account,
     * so the form cannot be used to find out who is registered.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink($request->only('email'));

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return back()->with([
            'reset_link_sent_to' => $request->input('email'),
            'reset_link_sent_at' => now()->format('H:i'),
        ]);
    }
}
