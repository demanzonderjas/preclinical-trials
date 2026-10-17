<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\TwoFactor;
use Illuminate\Console\Command;

/** For an admin who lost their phone and their recovery codes: they set up the app again on their next visit. */
class ResetTwoFactor extends Command
{
    protected $signature = 'pct:reset-two-factor {email}';

    protected $description = "Removes a user's two-factor authentication, so they set it up again";

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('No user with that email address.');

            return self::FAILURE;
        }

        TwoFactor::for($user)->disable();
        $this->info("Two-factor authentication removed for {$user->email}.");

        return self::SUCCESS;
    }
}
