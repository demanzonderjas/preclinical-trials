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
        $expected = config('pct.iles_token');
        if (!$request->token || !$expected || !hash_equals($expected, (string) $request->token)) {
            return response()->json(['success' => false, 'message' => 'invalid_iles_token']);
        }

        return $next($request);
    }
}
