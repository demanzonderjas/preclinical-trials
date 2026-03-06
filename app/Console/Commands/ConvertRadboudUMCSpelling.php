<?php

namespace App\Console\Commands;

use App\Models\Detail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class ConvertRadboudUMCSpelling extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'radboud:spelling';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert Radboud UMC spelling to correct spelling';

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

        $details = Detail::where('key', 'study_centre')->get();
        foreach ($details as $detail) {
            $studyCentres = $detail->value ?? [];
            foreach ($studyCentres as $studyCentre) {   
                if (strpos($studyCentre->name, 'RaboudUMC') !== false) {
                    $studyCentre->name = str_replace('RaboudUMC', 'Radboud UMC', $studyCentre->name);
                }
            }
            $detail->value = $studyCentres;
            $detail->save();
        }

        return 0;
    }
}
