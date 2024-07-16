<?php

namespace App\Imports;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Str;

class RadboudUsersImport implements ToModel, SkipsEmptyRows
{
    public function model(array $row)
    {

        $password = Str::random(16);
        echo $row[2] . " - " . $password . "\n";

        $user = User::firstOrNew(['email' => $row[2]]);
        $user->fill([
            'first_name' => $row[0],
            'last_name' => $row[1],
            'institution' => 'RadboudUMC',
            'country' => 'NL',
            'city' => 'Nijmegen',
            'role' => 'Responsible art 9',
            'email_verified_at' => Carbon::now(),
            'password' => Hash::make($password)
        ]);

        return $user;
    }
}
