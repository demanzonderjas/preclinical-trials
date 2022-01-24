<?php

namespace App\Console\Commands;

use App\Helpers\OldRecordDataImportHelper;
use App\Imports\DetailsImport;
use App\Models\Detail;
use App\Models\Protocol;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ImportDetails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:details';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import detailed data of protocols from the old Metaxis database of preclinical-trials.eu';

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
        $oldDetails = DB::connection('mysql2')->table('recorddata')->get();
        $importHelper = new OldRecordDataImportHelper();
        foreach ($oldDetails as $row) {
            $importHelper->importDataRow((array) $row);
        }

        $protocols = Protocol::all();
        $protocols->each(function ($p) {
            $totalDetails = $p->details->count();
            if ($totalDetails === 0) {
                $p->delete();
            }
        });

        return 0;
    }
}
