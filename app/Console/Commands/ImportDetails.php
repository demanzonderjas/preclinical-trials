<?php

namespace App\Console\Commands;

use App\Imports\DetailsImport;
use Illuminate\Console\Command;
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
        ini_set('memory_limit', '1024M'); // or you could use 1G
        Excel::import(new DetailsImport, 'details.csv');
        return 0;
    }
}
