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
        if (!$request->bearerToken() || !env('EXTERNAL_API_KEY') || $request->bearerToken() !== env('EXTERNAL_API_KEY')) {
            return response()->json(['success' => false, 'message' => 'invalid_api_key']);
        }

        return $next($request);
    }
}
