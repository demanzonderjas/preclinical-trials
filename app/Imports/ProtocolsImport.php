<?php

namespace App\Imports;

use App\Models\Protocol;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProtocolsImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $user = User::find($row["userid"]);
            if (empty($user)) {
                continue;
            }
            $status = $this->convertStatus($row["recordstatus"]);
            if ($status === "deleted") {
                continue;
            }
            Protocol::create([
                'id' => $row["recordid"],
                'created_at' => $row["utcdatecreated"],
                'updated_at' => $row["utclastupdated"],
                'user_id' => $row["userid"],
                'status' => $status
            ]);
        }
    }

    public function convertStatus(string $oldStatus)
    {
        $mappingTable = [
            "Deleted" => "deleted",
            "In process" => "draft",
            "Published" => "published",
            "Rejected" => "rejected",
            "Embargoed" => "published",
            "Submitted" => "submitted_for_publication"
        ];
        return $mappingTable[$oldStatus];
    }
}
