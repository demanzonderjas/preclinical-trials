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

    /**
     * Logs in from the A2 page (Inertia: redirect or validation errors) or from the legacy
     * SPA (JSON).
     */
    public function store(LoginRequest $request)
    {
        $response = $request->authenticate();

        if ($response["success"]) {
            $request->session()->regenerate();
        }

        if (! $request->header('X-Inertia')) {
            return response()->json($response);
        }

        if (! $response["success"]) {
            return back()->withErrors($response["errors"])->onlyInput('email');
        }

        // The dashboard is still a legacy page, so leave Inertia with a full page load.
        return Inertia::location(redirect()->intended('/dashboard')->getTargetUrl());
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

        // A full page load, so legacy pages and Inertia pages both start fresh.
        return $request->header('X-Inertia') ? Inertia::location('/') : redirect('/');
    }
}
