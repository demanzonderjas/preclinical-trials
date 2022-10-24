<?php

namespace App\Http\Middleware;

use App\Models\Channel;
use App\Models\Protocol;
use Closure;
use Illuminate\Http\Request;

class VerifyUserHasChannelAccess
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
        $targetChannel = Channel::find($request->channel_id);

        if (empty($targetChannel)) {
            return $next($request);
        }

        if ($targetChannel->questioner->id !== $request->user()->id && $targetChannel->protocolOwner->id !== $request->user()->id && !$request->user()->is_admin) {
            return abort(403, 'Not your channel.');
        }

        return $next($request);
    }
}
