<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // F13: at least 12 characters with upper and lower case and a number. Existing
        // passwords keep working; the rule applies when a password is set or changed.
        Password::defaults(fn () => Password::min(12)->mixedCase()->numbers());

        // Applied to every /api route. A named limiter keeps its own counter, so it no longer
        // eats into stricter route limits such as the contact form's throttle:10,1.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
