<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Remembers when a logged-in user was last active, at most every five minutes. */
class TrackLastActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && (! $user->last_active_at || $user->last_active_at->lt(now()->subMinutes(5)))) {
            // Not through the model: "last updated" on the profile is about the details.
            $user->newQuery()->whereKey($user->getKey())->toBase()->update(['last_active_at' => now()]);
            $user->setAttribute('last_active_at', now())->syncOriginalAttribute('last_active_at');
        }

        return $next($request);
    }
}
