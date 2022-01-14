<?php

namespace App\Imports;

use App\Helpers\OldRecordDataImportHelper;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DetailsImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        $importHelper = new OldRecordDataImportHelper();
        foreach ($rows as $row) {
            $importHelper->importDataRow($row);
        }
    }
}
