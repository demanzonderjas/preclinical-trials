<?php

namespace App\Console\Commands;

use App\Imports\EmbargoDateImport;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

class ImportEmbargoDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'embargo:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import embargo dates via Excel-sheet';

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

        Excel::import(new EmbargoDateImport, 'embargo-dates.csv');

        return 0;
    }
}
