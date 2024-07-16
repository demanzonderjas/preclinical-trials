<?php

namespace App\Console\Commands;

use App\Imports\RadboudUsersImport;
use App\Models\User;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

class ImportRadboudUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:radboud';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import Radboud user list and generate random passwords';

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
        Excel::import(new RadboudUsersImport, 'radboud_import.csv');

        return 0;
    }
}
