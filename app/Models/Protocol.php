<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Protocol extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(Detail::class);
    }

    public function saveDetails(Request $request)
    {
        $validKeys = array_filter($request->all(), function ($key) {
            return in_array($key, config('pct.valid_protocol_keys'));
        }, ARRAY_FILTER_USE_KEY);
        $details = collect($validKeys);
        $details->each(function ($value, $key) {
            $detail = Detail::firstOrNew(['protocol_id' => $this->id, 'key' => $key]);
            $detail->key = $key;
            $detail->value = $value;
            $this->details()->save($detail);
        });
    }

    public function getHasEmbargoAttribute()
    {
        $detail = $this->details->first(function ($d) {
            return $d->key === "has_embargo";
        });
        return !empty($detail) ? $detail->value === "yes" : false;
    }
}
