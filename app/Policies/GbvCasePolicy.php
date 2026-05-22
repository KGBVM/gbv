<?php

namespace App\Policies;

use App\Models\GbvCase;
use App\Models\User;

class GbvCasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if user can view any cases
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine if user can view the case
     */
    public function view(User $user, GbvCase $gbvCase)
    {
        // Super admin can view any case
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin can view any case
        if ($user->isAdmin()) {
            return true;
        }

        // GBV officers can only view cases from their partner
        if ($user->isGbvOfficer()) {
            return $gbvCase->partner_id === $user->partner_id;
        }

        // Case workers can only view cases they are assigned to
        if ($user->isCaseWorker()) {
            return $gbvCase->primary_officer_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can create cases
     */
    public function create(User $user)
    {
        // Super admin and admin can create cases
        if ($user->isSuperAdmin() || $user->isAdmin()) {
            return true;
        }

        // GBV officers can create cases
        if ($user->isGbvOfficer()) {
            return true;
        }

        // Case workers can create cases
        if ($user->isCaseWorker()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if user can update the case
     */
    public function update(User $user, GbvCase $gbvCase)
    {
        // Cannot update concluded cases
        if ($gbvCase->status === 'concluded') {
            return false;
        }

        // Super admin can update any case
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin can update any case
        if ($user->isAdmin()) {
            return true;
        }

        // GBV officers can update cases from their partner
        if ($user->isGbvOfficer()) {
            return $gbvCase->partner_id === $user->partner_id;
        }

        // Case workers can only update cases they are assigned to
        if ($user->isCaseWorker()) {
            return $gbvCase->primary_officer_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can delete the case
     */
    public function delete(User $user, GbvCase $gbvCase)
    {
        // Only super admin and admin can delete
        return $user->isSuperAdmin() || $user->isAdmin();
    }

    /**
     * Determine if user can conclude the case
     */
    public function conclude(User $user, GbvCase $gbvCase)
    {
        // Only active cases can be concluded
        if ($gbvCase->status === 'concluded') {
            return false;
        }

        // Super admin can conclude any case
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin can conclude any case
        if ($user->isAdmin()) {
            return true;
        }

        // GBV officers can conclude cases from their partner
        if ($user->isGbvOfficer()) {
            return $gbvCase->partner_id === $user->partner_id;
        }

        // Case workers can conclude cases they are assigned to
        if ($user->isCaseWorker()) {
            return $gbvCase->primary_officer_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can add notes to the case
     */
    public function addNote(User $user, GbvCase $gbvCase)
    {
        // Same permissions as update
        return $this->update($user, $gbvCase);
    }

    /**
     * Determine if user can import cases
     */
    public function import(User $user)
    {
        // Only super admin can import
        return $user->isSuperAdmin();
    }

    /**
     * Determine if user can export cases
     */
    public function export(User $user)
    {
        // Only super admin can export
        return $user->isSuperAdmin();
    }

    /**
     * Determine if user can refer the case to another partner
     */
    public function refer(User $user, GbvCase $gbvCase)
    {
        // Cannot refer concluded cases
        if ($gbvCase->status === 'concluded') {
            return false;
        }

        // Super admin and admin can refer any case
        if ($user->isSuperAdmin() || $user->isAdmin()) {
            return true;
        }

        // GBV officers can refer cases from their partner
        if ($user->isGbvOfficer()) {
            return $gbvCase->partner_id === $user->partner_id;
        }

        return false;
    }

    /**
     * Determine if user can restore a soft-deleted case
     */
    public function restore(User $user)
    {
        // Only super admin can restore
        return $user->isSuperAdmin();
    }

    /**
     * Determine if user can permanently delete a case
     */
    public function forceDelete(User $user)
    {
        // Only super admin can force delete
        return $user->isSuperAdmin();
    }
}