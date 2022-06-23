<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyILESToken
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
        if (!$request->token || !env('ILES_TOKEN') || $request->token !== env('ILES_TOKEN')) {
            return response()->json(['success' => false, 'message' => 'invalid_iles_token']);
        }

        return $next($request);
    }
}
