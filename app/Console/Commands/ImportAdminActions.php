<?php

namespace App\Console\Commands;

use App\Models\AdminAction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportAdminActions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:actions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Imports the history of Admin actions from the Metaxis database';

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
        $actionHistory = DB::connection('mysql2')->table('recordversion')->where('RecordStatus', 'Submitted')->get();
        collect($actionHistory);
        $actionHistory->each(function ($action) {
            $nextAction = DB::connection('mysql2')->table('recordversion')
                ->where('RecordID', $action->RecordID)->where('VersionID', '>', $action->VersionID)
                ->first();
            if (!$nextAction) {
                return;
            }
            $newAction = new AdminAction();
            $newAction->protocol_id = $action->RecordID;
            $newAction->action = $nextAction->RecordStatus === "Published" || $nextAction->RecordStatus === "Embargoed" ? "approve" : "reject";
            $newAction->message = $nextAction->Notes;
            $newAction->save();
        });

        return 0;
    }
}
