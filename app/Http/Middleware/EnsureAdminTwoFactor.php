<?php

namespace App\Http\Middleware;

use App\Services\TwoFactor;
use Closure;
use Illuminate\Http\Request;

/**
 * The admin area asks for a code from the admin's authenticator app once per session,
 * and has them set one up first. The session remembers which user passed.
 */
class EnsureAdminTwoFactor
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->session()->get(TwoFactor::SESSION_KEY) === $request->user()->id) {
            return $next($request);
        }

        if ($request->isMethod('GET')) {
            $request->session()->put('url.intended', $request->fullUrl());
        }

        return redirect()->route('admin.two-factor');
    }
}
