<?php

namespace App\Console\Commands;

use App\Mail\EmbargoFirstReminder;
use App\Mail\EmbargoSecondReminder;
use App\Models\EmbargoEndDate;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendEmbargoReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'embargo:reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send the reminders for the embargoed protocols';

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
        $embargoEndDates = EmbargoEndDate::all();

        $embargoEndDates->each(function ($embargoEndDate) {
            $diffInDays = Carbon::now()->diffInDays(new Carbon($embargoEndDate->date), false);

            if ($diffInDays >= -14 && $embargoEndDate->mail_status === "first_reminder") {
                Mail::to($embargoEndDate->protocol->user)->send(new EmbargoSecondReminder($embargoEndDate));
                $embargoEndDate->mail_status = "second_reminder";
                $embargoEndDate->save();
            } else if ($diffInDays >= -30 && $embargoEndDate->mail_status === NULL) {
                Mail::to($embargoEndDate->protocol->user)->send(new EmbargoFirstReminder($embargoEndDate));
                $embargoEndDate->mail_status = "first_reminder";
                $embargoEndDate->save();
            }
        });
    }
}
