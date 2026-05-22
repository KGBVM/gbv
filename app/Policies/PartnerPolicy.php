<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;

class PartnerPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Partner $partner)
    {
        return true;
    }

    public function create(User $user)
    {
        return true;
    }

    public function update(User $user, Partner $partner)
    {
        return true;
    }

    public function delete(User $user, Partner $partner)
    {
        return true;
    }

    public function restore(User $user, Partner $partner)
    {
        return true;
    }

    public function forceDelete(User $user, Partner $partner)
    {
        return true;
    }

    public function approve(User $user, Partner $partner)
    {
        return $user->isSuperAdmin();
    }

    public function reject(User $user, Partner $partner)
    {
        return $user->isSuperAdmin();
    }

    public function import(User $user)
    {
        return $user->isSuperAdmin();
    }

    public function export(User $user)
    {
        return $user->isSuperAdmin();
    }
}
