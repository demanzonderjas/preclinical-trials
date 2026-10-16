<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    /**
     * The A2 log in page.
     */
    public function create(Request $request)
    {
        if ($request->user()) {
            return redirect('/dashboard');
        }

        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /** Logs in: back to the form with errors, or on to the page the user wanted. */
    public function store(LoginRequest $request)
    {
        $response = $request->authenticate();

        if (! $response["success"]) {
            return back()->withErrors($response["errors"])->onlyInput('email');
        }

        $request->session()->regenerate();

        // A full page load: the intended URL can be a download (a PDF or the CSV export).
        $target = redirect()->intended('/dashboard')->getTargetUrl();

        return $request->header('X-Inertia') ? Inertia::location($target) : redirect($target);
    }

    /**
     * Destroy an authenticated session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        // A full page load, so nothing of the session stays in the page.
        return $request->header('X-Inertia') ? Inertia::location('/') : redirect('/');
    }
}
