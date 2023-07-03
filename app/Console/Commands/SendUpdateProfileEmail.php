<?php

namespace App\Console\Commands;

use App\Mail\UpdateProfileEmail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendUpdateProfileEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends the email to ask users to update their profile';

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

        $users = User::where('email', 'julia.menon@heart-institute.nl')->get();

        foreach ($users as $user) {
            Mail::to($user)->queue(new UpdateProfileEmail($user));
        }

        return 0;
    }
}
