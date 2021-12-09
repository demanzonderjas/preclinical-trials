<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;

class UsersImport implements ToCollection
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            User::create([
                'id' => $row[0],
                'email' => $row[1],
                'password' => Hash::make(Str::random(16)),
                'first_name' => $row[3],
                'last_name' => $row[4],
                'institution' => $row[7]
            ]);
        }
    }
}
