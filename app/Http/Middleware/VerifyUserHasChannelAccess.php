<?php

namespace App\Http\Middleware;

use App\Models\Channel;
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

        if (! $targetChannel->isParticipant($request->user())) {
            return abort(403, 'Not your channel.');
        }

        return $next($request);
    }
}
