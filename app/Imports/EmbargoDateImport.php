<?php

namespace App\Imports;

use App\Models\EmbargoEndDate;
use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EmbargoDateImport implements ToCollection, WithHeadingRow
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

            if (empty($protocol) || !$protocol->has_embargo) {
                continue;
            }


            $embargoDate = EmbargoEndDate::firstOrNew([
                "protocol_id" => $cleanId,
            ]);
            $embargoDate->date = Carbon::create($row['registration_date'])->addYear()->toDateString();
            $embargoDate->protocol_id = $cleanId;
            $embargoDate->save();
        }
    }
}
