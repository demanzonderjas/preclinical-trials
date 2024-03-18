<?php

namespace App\Console\Commands;

use App\Mail\ProtocolEndDateReminder;
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
    protected $signature = 'mail:test-end-date';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends a test email to see how the end date email reminder looks';

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

        $user = User::where('email', 'daan@puzzel.org')->first();
        $protocol = $user->protocols->first();
        Mail::to($user)->send(new ProtocolEndDateReminder($protocol));
    }
}
