<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\County;
use App\Models\SubCounty;
use App\Models\Ward;
use App\Models\Village;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    private ?int $countyId = null;
    private ?int $subCountyId = null;
    private ?int $wardId = null;
    private ?int $villageId = null;

    public function run(): void
    {
        $this->loadKituiLocationIds();

        if (!$this->countyId || !$this->subCountyId || !$this->wardId) {
            $this->command->error('Location setup incomplete. Seeder aborted.');
            return;
        }

        $this->createSuperAdmin();
        $this->createAdmins();
    }

    /*
    |--------------------------------------------------------------------------
    | Location Loader
    |--------------------------------------------------------------------------
    */
    private function loadKituiLocationIds(): void
    {
        $county = County::where('name', 'LIKE', '%Kitui%')->first();
        $this->countyId = $county?->id;

        $subCounty = SubCounty::where('name', 'LIKE', '%Kitui Central%')
            ->where('county_id', $this->countyId)
            ->first();

        $this->subCountyId = $subCounty?->id;

        $ward = Ward::where('name', 'LIKE', '%Township%')
            ->where('sub_county_id', $this->subCountyId)
            ->first();

        $this->wardId = $ward?->id;

        $village = Village::where('name', 'LIKE', '%Town%')
            ->where('ward_id', $this->wardId)
            ->first();

        $this->villageId = $village?->id;
    }

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    */
    private function createSuperAdmin(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'super.admin@eservices.co.ke'],
            [
                'name' => 'Dr. James Mwangi',
                'phone' => '0722000001',
                'password' => Hash::make('SuperAdmin@123'),
                'county_id' => $this->countyId,
                'sub_county_id' => $this->subCountyId,
                'ward_id' => $this->wardId,
                'village_id' => $this->villageId,
                'partner_id' => null,
                'badge_number' => 'ADMIN-001',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $user->syncRoles(['super_admin']);
    }

    /*
    |--------------------------------------------------------------------------
    | Admins
    |--------------------------------------------------------------------------
    */
    private function createAdmins(): void
    {
        $admins = [
            [
                'name' => 'Sarah Kimani',
                'email' => 'sarah.kimani@eservices.co.ke',
                'phone' => '0722000002',
                'badge_number' => 'ADMIN-002',
            ],
            [
                'name' => 'John Omondi',
                'email' => 'john.omondi@eservices.co.ke',
                'phone' => '0722000003',
                'badge_number' => 'ADMIN-003',
            ],
        ];

        foreach ($admins as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => Hash::make('Admin@123'),
                    'county_id' => $this->countyId,
                    'sub_county_id' => $this->subCountyId,
                    'ward_id' => $this->wardId,
                    'village_id' => $this->villageId,
                    'badge_number' => $data['badge_number'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $user->syncRoles(['admin']);
        }
    }
}
