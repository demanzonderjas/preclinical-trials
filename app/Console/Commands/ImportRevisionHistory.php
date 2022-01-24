<?php

namespace App\Console\Commands;

use App\Helpers\OldRecordDataImportHelper;
use App\Models\Protocol;
use App\Models\Revision;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportRevisionHistory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:revisions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import and convert the old revision history from the Metaxis database';

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
        $versions = DB::connection('mysql2')->table('recordversion')->where('RecordStatus', 'Submitted')->get();
        $importHelper = new OldRecordDataImportHelper();
        collect($versions);
        $versions->each(function ($version) use ($importHelper) {
            $oldVersion = DB::connection('mysql2')->table('recordversion')->where([
                'RecordID' => $version->RecordID,
                'RecordStatus' => 'Submitted'
            ])->where('VersionID', '<', $version->VersionID)->latest('utcDateCreated')->first();
            if (!$oldVersion) {
                return;
            }
            $newRecordData = DB::connection('mysql2')->table('recorddata')->where('VersionID', $version->VersionID)->get();
            $changes = [];

            foreach ($newRecordData as $newValue) {
                $oldValue = DB::connection('mysql2')->table('recorddata')->where([
                    'FieldTag' => $newValue->FieldTag,
                    'Subtag' => $newValue->Subtag,
                    'VersionID' => $oldVersion->VersionID
                ])->first();

                $convertedFieldName = $importHelper->convertFieldName((array) $newValue);
                $convertedNewValue = $importHelper->convertFieldValue($convertedFieldName, $newValue->FieldValue);
                $convertedOldValue = isset($oldValue->FieldValue) ? $importHelper->convertFieldValue($convertedFieldName, $oldValue->FieldValue) : "";

                if ($convertedFieldName === null) {
                    continue;
                }

                if ($convertedNewValue != $convertedOldValue) {
                    $changes[] = [
                        "key" => $convertedFieldName,
                        "old_value" => $convertedOldValue,
                        "new_value" => $convertedNewValue,
                    ];
                }
            }
            if (count($changes) > 0) {
                $protocol = Protocol::find($version->RecordID);
                if (!$protocol) {
                    return;
                }
                $protocol->revisions()->saveMany([
                    new Revision([
                        "changes" => $changes,
                        "created_at" => $newValue->utcLastUpdated,
                        "updated_at" => $newValue->utcLastUpdated,
                    ])
                ]);
            }
        });

        return 0;
    }
}
