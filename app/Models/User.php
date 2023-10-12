<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'id',
        'first_name',
        'last_name',
        'institution',
        'email',
        'password',
    ];

    protected $with = ['settings'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'is_verified'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function protocols()
    {
        return $this->hasMany(Protocol::class);
    }

    public function settings()
    {
        return $this->hasMany(Setting::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function getIsAdminAttribute()
    {
        return $this->roles->contains(function ($role) {
            return $role->name === 'admin';
        });
    }

    public function sendPasswordResetNotification($token)
    {
        $url = env('APP_URL') . '/reset-password/' . $token;

        $this->notify(new \App\Notifications\ResetPasswordNotification($url, $this));
    }

    public function getIsVerifiedAttribute()
    {
        return !empty($this->email_verified_at);
    }

    public function getNameAttribute()
    {
        return $this->first_name . " " . $this->last_name;
    }

    public function getDisableNotificationsAttribute()
    {
        $setting = $this->settings->first(function ($s) {
            return $s->key === "disable_notifications";
        });
        if (empty($setting)) {
            return false;
        }
        return boolval($setting->value);
    }
}
