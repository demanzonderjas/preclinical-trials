<?php

namespace App\Console\Commands;

use App\Imports\ProtocolsImport;
use App\Imports\UsersImport;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

class ImportUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:protocols';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import protocols from the old Metaxis database of preclinical-trials.eu';

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
        Excel::import(new ProtocolsImport, 'protocols.csv');
        return 0;
    }
}
