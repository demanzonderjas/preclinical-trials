<?php

namespace App\Console\Commands;

use App\Mail\EmbargoFirstReminder;
use App\Mail\EmbargoLifted;
use App\Mail\EmbargoSecondReminder;
use App\Models\Detail;
use App\Models\EmbargoEndDate;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckEmbargoStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'embargo:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the status for the embargoed protocols';

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
        $embargoEndDates = EmbargoEndDate::where('is_active', TRUE)->get();

        $embargoEndDates->each(function ($embargoEndDate) {
            $diffInDays = Carbon::now()->diffInDays(new Carbon($embargoEndDate->date), false);

            $NEEDS_FIRST_REMINDER = $diffInDays <= 14 && $diffInDays > 0 && $embargoEndDate->mail_status === "first_reminder";
            $NEEDS_SECOND_REMINDER = $diffInDays <= 30 && $diffInDays > 0 && $embargoEndDate->mail_status === NULL;
            $NEEDS_EMBARGO_LIFT = $diffInDays <= 0;

            if ($NEEDS_FIRST_REMINDER) {
                // Mail::to($embargoEndDate->protocol->user)->send(new EmbargoFirstReminder($embargoEndDate));
                // $embargoEndDate->mail_status = "first_reminder";
                // $embargoEndDate->save();
            } else if ($NEEDS_SECOND_REMINDER) {
                // Mail::to($embargoEndDate->protocol->user)->send(new EmbargoSecondReminder($embargoEndDate));
                // $embargoEndDate->mail_status = "second_reminder";
                // $embargoEndDate->save();
            } else if ($NEEDS_EMBARGO_LIFT) {
                // $embargoEndDate->mail_status = NULL;
                // $embargoEndDate->is_active = false;
                // $embargoEndDate->save();

                // $detail = Detail::where(["protocol_id" => $embargoEndDate->protocol->id, "key" => "has_embargo"])->firstOrFail();
                // $detail->value = "no";
                // $detail->save();

                // Mail::to($embargoEndDate->protocol->user)->send(new EmbargoLifted($embargoEndDate->protocol));
                echo "\n" . $embargoEndDate->protocol->id . "\n";
            }
        });
    }
}
