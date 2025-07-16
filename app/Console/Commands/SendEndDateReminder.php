<?php

namespace App\Console\Commands;

use App\Mail\ProtocolEndDateReminder;
use App\Mail\ProtocolEndDateReminderFollowUp;
use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendEndDateReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'enddate:reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check if the end date of the study is approaching';

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
        $protocols = Protocol::all();

        $protocols->each(function (Protocol $protocol) {

            $detail = $protocol->details->first(function ($d) {
                return $d->key === "end_date";
            });
            $end_date = !empty($detail) ? $detail->value : null;

            if (empty($end_date)) {
                return;
            }

            $diffInDays = Carbon::now()->diffInDays(new Carbon($end_date), false);

            $NEEDS_REMINDER = $diffInDays === -90;
            $NEEDS_SECOND_REMINDER = $diffInDays === -365;
            $NEEDS_THIRD_REMINDER = $diffInDays === -730;

            if ($NEEDS_REMINDER) {
                Mail::to($protocol->user)->send(new ProtocolEndDateReminder($protocol));
            } else if($NEEDS_SECOND_REMINDER || $NEEDS_THIRD_REMINDER) {
                Mail::to($protocol->user)->send(new ProtocolEndDateReminderFollowUp($protocol)); 
            }
        });
    }
}
