<?php

namespace App\Http\Middleware;

use App\Models\Protocol;
use Closure;
use Illuminate\Http\Request;

class EnsureUserIsOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // The route parameter wins: request input must not be able to point this check at
        // a different protocol than the one the controller acts on.
        $targetProtocol = Protocol::findOrFail($request->route('protocol_id') ?? $request->input('protocol_id'));

        if ($targetProtocol->user->id !== $request->user()->id && !$request->user()->is_admin) {
            return abort(403, 'Not your protocol.');
        }

        return $next($request);
    }
}
