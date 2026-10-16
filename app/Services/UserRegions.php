<?php

namespace App\Services;

use App\Models\Protocol;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/** The region figures the PCT team reports on (legacy UserController::getRegionSpecificStats). */
class UserRegions
{
    /** @return array{total: int, dutch: int, utrecht: int, nijmegen: int, utrecht_nijmegen_protocols: int} */
    public static function figures(): array
    {
        $utrecht = fn (Builder $q) => $q->where('institution', 'LIKE', '%Utrecht%')->orWhereIn('institution', ['uu', 'hu', 'uumc']);
        $nijmegen = fn (Builder $q) => $q->where('institution', 'LIKE', '%Radboud%');

        return [
            'total' => User::count(),
            'dutch' => User::where('country', 'NL')->count(),
            'utrecht' => User::where($utrecht)->count(),
            'nijmegen' => User::where($nijmegen)->count(),
            'utrecht_nijmegen_protocols' => Protocol::whereHas('user', fn (Builder $q) => $q->where(fn ($q) => $utrecht($q))->orWhere(fn ($q) => $nijmegen($q)))->count(),
        ];
    }
}
