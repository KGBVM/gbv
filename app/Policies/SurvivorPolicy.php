<?php

namespace App\Policies;

use App\Models\Survivor;
use App\Models\User;

class SurvivorPolicy
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

    public function view(User $user, Survivor $survivor)
    {
        return true;
    }

    public function create(User $user)
    {
        return true;
    }

    public function update(User $user, Survivor $survivor)
    {
        return true;
    }

    public function delete(User $user, Survivor $survivor)
    {
        // Only admin can delete
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
