<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyExternalApiKey
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
        $expected = config('pct.external_api_key');
        if (!$request->bearerToken() || !$expected || !hash_equals($expected, $request->bearerToken())) {
            return response()->json(['success' => false, 'message' => 'invalid_api_key']);
        }

        return $next($request);
    }
}
