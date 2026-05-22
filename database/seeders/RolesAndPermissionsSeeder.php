<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Permissions (Structured for GBV System)
        |--------------------------------------------------------------------------
        */
        $permissions = [

            // Case management
            'cases.view',
            'cases.create',
            'cases.update',
            'cases.delete',
            'cases.assign',

            // Survivor data
            'survivors.view',
            'survivors.create',
            'survivors.update',

            // Reports
            'reports.view',
            'reports.print',
            'reports.export',

            // System administration
            'users.manage',
            'roles.manage',
            'permissions.manage',

            // Partner-level control
            'partners.view',
            'partners.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Roles Definition
        |--------------------------------------------------------------------------
        */
        $roles = [

            'super_admin' => Permission::all(),

            'admin' => [
                'cases.view',
                'cases.create',
                'cases.update',
                'cases.assign',

                'survivors.view',
                'survivors.create',
                'survivors.update',

                'reports.view',
                'reports.print',
                'reports.export',

                'users.manage',
            ],

            'gbv_officer' => [
                'cases.view',
                'cases.create',
                'cases.update',

                'survivors.view',
                'survivors.create',
                'survivors.update',
            ],

            'viewer' => [
                'cases.view',
                'survivors.view',
                'reports.view',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Create Roles + Sync Permissions
        |--------------------------------------------------------------------------
        */
        foreach ($roles as $roleName => $rolePermissions) {

            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);

            $role->syncPermissions($rolePermissions);
        }
    }
}
