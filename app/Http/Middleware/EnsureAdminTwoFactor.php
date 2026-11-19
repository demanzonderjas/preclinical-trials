<?php

namespace App\Http\Middleware;

use App\Services\TwoFactor;
use Closure;
use Illuminate\Http\Request;

/**
 * The admin area asks for a code from the admin's authenticator app once per session,
 * and has them set one up first. The session remembers which user passed.
 * On a developer's machine (APP_ENV=local) the step is skipped.
 */
class EnsureAdminTwoFactor
{
    public function handle(Request $request, Closure $next)
    {
        if (TwoFactor::passed($request)) {
            return $next($request);
        }

        if ($request->isMethod('GET')) {
            $request->session()->put('url.intended', $request->fullUrl());
        }

        return redirect()->route('admin.two-factor');
    }
}
