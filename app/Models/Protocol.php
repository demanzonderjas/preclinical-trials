<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Protocol extends Model
{
    use HasFactory;

    protected $fillable = [
        "id",
        "user_id",
        "status",
        "created_at",
        "updated_at"
    ];

    protected $appends = ["title", "pct_id", "embargo_end_date", "registration_date"];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function linkedTo()
    {
        return $this->belongsToMany(Protocol::class, 'linked_protocols', 'protocol_id', 'linked_protocol_id');
    }

    public function linkedFrom()
    {
        return $this->belongsToMany(Protocol::class, 'linked_protocols', 'linked_protocol_id', 'protocol_id');
    }

    public function details()
    {
        return $this->hasMany(Detail::class);
    }

    public function revisions()
    {
        return $this->hasMany(Revision::class);
    }

    public function adminActions()
    {
        return $this->hasMany(AdminAction::class);
    }

    public function embargoEndDates()
    {
        return $this->hasMany(EmbargoEndDate::class);
    }


    public function embargoExtensions()
    {
        return $this->hasMany(EmbargoExtension::class);
    }

    public static function getValidKeys(array $data)
    {
        return array_filter($data, function ($key) {
            return in_array($key, config('pct.valid_protocol_keys'));
        }, ARRAY_FILTER_USE_KEY);
    }

    public function saveDetails(Request $request)
    {
        $validKeys = self::getValidKeys($request->all());
        $this->addDetailsToDatabase($validKeys);

        if (isset($request->import_type) && !empty($request->import_type)) {
            $log = ImportLog::firstOrNew(['protocol_id' => $this->id]);
            $log->type = $request->import_type;
            $log->save();
        }
    }

    public function addDetailsToDatabase(array $validKeys)
    {
        $details = collect($validKeys);
        $details->each(function ($value, $key) {
            $detail = Detail::firstOrNew(['protocol_id' => $this->id, 'key' => $key]);
            $detail->key = $key;
            $detail->value = $value;
            $this->details()->save($detail);
        });
    }

    public function saveRevisions(Request $request)
    {
        $validKeys = array_filter($request->all(), function ($key) {
            return in_array($key, config('pct.valid_protocol_keys'));
        }, ARRAY_FILTER_USE_KEY);
        $currentDetails = collect($validKeys);
        $changes = [];
        $currentDetails->each(function ($value, $key) use (&$changes) {
            $detail = Detail::firstOrNew(['protocol_id' => $this->id, 'key' => $key]);
            $valueIsString = is_string($detail->value) && is_string($value);

            if ($valueIsString && str_replace(array("\r", "\n"), '', trim($detail->value)) != str_replace(array("\r", "\n"), '', trim($value))) {
                $changes[] = [
                    "key" => $key,
                    "old_value" => $detail->value,
                    "new_value" => $value
                ];
            } else if (str_replace(array("\r", "\n"), '', trim(json_encode($detail->value), " \t\n\r\0\x0B\"")) != str_replace(array("\r", "\n"), '', trim(json_encode($value), " \t\n\r\0\x0B\""))) {
                $changes[] = [
                    "key" => $key,
                    "old_value" => $detail->value,
                    "new_value" => $value
                ];
            }
            $detail->value = $value;
            $this->details()->save($detail);
        });
        if (count($changes) > 0) {
            $this->revisions()->saveMany([
                new Revision([
                    "changes" => $changes,
                    "admin_only" => $this->status != "published"
                ])
            ]);
        }
    }

    public function getHasEmbargoAttribute()
    {
        $detail = $this->details->first(function ($d) {
            return $d->key === "has_embargo";
        });
        return !empty($detail) ? $detail->value !== "no" : false;
    }

    public function getTitleAttribute()
    {
        $detail = $this->details->first(function ($d) {
            return $d->key === "title";
        });
        return !empty($detail) ? $detail->value : "No title was given yet.";
    }

    public function hideContactDetails()
    {
        $this->details = $this->details->filter(function (Detail $d) {
            return strpos($d->key, "contact_") === false;
        });
    }

    public function getPctIdAttribute()
    {
        return "PCTE0000" . $this->id;
    }

    public function getEmbargoEndDateAttribute()
    {
        if (!$this->has_embargo) {
            return null;
        }

        $endDate = $this->embargoEndDates->first(function ($d) {
            return $d->is_active;
        });
        return !empty($endDate) ? $endDate->date : null;
    }

    public function getLinkedAttribute()
    {
        return $this->linkedTo->merge($this->linkedFrom);
    }

    public function getRegistrationDateAttribute()
    {
        if (!count($this->adminActions)) {
            return null;
        }

        $approveAction = $this->adminActions->first(function (AdminAction $a) {
            return $a->action === 'approve';
        });
        return !empty($approveAction) ? $approveAction->created_at : null;
    }
}
