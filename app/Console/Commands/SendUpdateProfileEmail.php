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

        $users = User::all();

        $batchNumber = $this->ask('What batch would you like to start?');
        $size = 450;
        $start = $size * intval($batchNumber);
        $end = $size * (intval($batchNumber) + 1);
        $this->info($start . " - " . $end);

        for ($i = $start; $i < $end; $i++) {
            $user = $users[$i];
            Mail::to($user)->queue(new UpdateProfileEmail($user));
            $this->info('Mail to ' . $user->email . ' has been queued.');
        }
    }
}
