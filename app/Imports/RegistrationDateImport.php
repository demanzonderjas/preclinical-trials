<?php

namespace App\Imports;

use App\Models\AdminAction;
use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RegistrationDateImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $id = $row['id'];
            $idNumberWithout0000 = str_replace("PCTE0000", "", $id);
            $cleanId = str_replace("PCTE000", "", $idNumberWithout0000);

            $protocol = Protocol::find($cleanId);

            if (empty($protocol)) {
                continue;
            }


            $approveAction = AdminAction::firstOrNew([
                "protocol_id" => $cleanId,
                "action" => "approve"
            ]);
            $importedRegistrationDate = Carbon::create($row['registration_date']);
            $approveAction->created_at = $importedRegistrationDate->toDateString();
            $approveAction->save();
        }
    }
}
