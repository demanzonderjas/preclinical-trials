<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (!$row['useremail']) {
                continue;
            }
            User::create([
                'id' => $row['userid'],
                'email' => $row['useremail'],
                'password' => Hash::make(Str::random(16)),
                'first_name' => $row['firstname'],
                'last_name' => $row['lastname'],
                'institution' => $row['institution']
            ]);
        }
    }
}
