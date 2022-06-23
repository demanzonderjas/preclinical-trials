<?php

namespace App\Console\Commands;

use App\Models\Detail;
use Illuminate\Console\Command;

class EncryptProtocols extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'encrypt:protocols';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Encrypt the protocols in the database';

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
        Detail::all()->each(function ($detail) {
            $detail->value = $detail->value;
            $detail->save();
        });

        return 0;
    }
}
