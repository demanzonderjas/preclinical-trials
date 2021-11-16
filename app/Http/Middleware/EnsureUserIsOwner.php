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
        $targetProtocol = Protocol::findOrFail($request->protocol_id);

        if ($targetProtocol->user->id !== $request->user()->id) {
            return abort(403, 'Not your protocol.');
        }

        return $next($request);
    }
}
