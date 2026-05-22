<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | Mass Assignable
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'password',

        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',

        'partner_id',
        'badge_number',

        'is_active',
        'last_login_at',
        'password_changed_at',
        'login_attempts',
        'locked_until',
    ];

    /*
    |--------------------------------------------------------------------------
    | Hidden Attributes
    |--------------------------------------------------------------------------
    */

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
    |--------------------------------------------------------------------------
    | Attribute Casting
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'locked_until' => 'datetime',

        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function casesCreated()
    {
        return $this->hasMany(GbvCase::class, 'created_by');
    }

    public function assignedCases()
    {
        return $this->hasMany(GbvCase::class, 'primary_officer_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Role Helpers
    |--------------------------------------------------------------------------
    */

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isGbvOfficer(): bool
    {
        return $this->hasRole('gbv_officer');
    }

    public function isPartnerUser(): bool
    {
        return $this->hasRole('partner_user');
    }

    public function canAccessPartnerCases(): bool
    {
        return $this->hasAnyRole([
            'gbv_officer',
            'partner_user',
        ]);
    }

    public function getPartnerId(): ?int
    {
        return $this->canAccessPartnerCases()
            ? $this->partner_id
            : null;
    }
}
