<?php

namespace App\Console\Commands;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UsersVerifyEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:verify-email';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifies all the emails of the current users';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        User::all()->each(function (User $user) {
            $user->email_verified_at = Carbon::now();
            $user->save();
        });

        return 0;
    }
}
