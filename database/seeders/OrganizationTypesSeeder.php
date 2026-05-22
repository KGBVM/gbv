<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationTypesSeeder extends Seeder
{
    public function run()
    {
        $types = [
            [
                'name' => 'Hospital/Health Facility',
                'slug' => 'hospital',
                'icon' => '🏥',
                'sort_order' => 1
            ],
            [
                'name' => 'Police Station/Law Enforcement',
                'slug' => 'police',
                'icon' => '👮',
                'sort_order' => 2
            ],
            [
                'name' => 'Non-Governmental Organization (NGO)',
                'slug' => 'ngo',
                'icon' => '🤝',
                'sort_order' => 3
            ],
            [
                'name' => 'Community Based Organization (CBO)',
                'slug' => 'cbo',
                'icon' => '🏘️',
                'sort_order' => 4
            ],
            [
                'name' => 'Faith Based Organization (FBO)',
                'slug' => 'fbo',
                'icon' => '⛪',
                'sort_order' => 5
            ],
            [
                'name' => 'Government Agency',
                'slug' => 'government',
                'icon' => '🏛️',
                'sort_order' => 6
            ],
            [
                'name' => 'Legal Aid/Justice Center',
                'slug' => 'legal',
                'icon' => '⚖️',
                'sort_order' => 7
            ],
            [
                'name' => 'Shelter/Safe House',
                'slug' => 'shelter',
                'icon' => '🏠',
                'sort_order' => 8
            ],
            [
                'name' => 'Educational Institution',
                'slug' => 'education',
                'icon' => '📚',
                'sort_order' => 9
            ],
            [
                'name' => 'International Organization',
                'slug' => 'international',
                'icon' => '🌍',
                'sort_order' => 10
            ],
            [
                'name' => 'Private Sector/Corporate',
                'slug' => 'private',
                'icon' => '💼',
                'sort_order' => 11
            ],
            [
                'name' => 'Other',
                'slug' => 'other',
                'icon' => '📝',
                'sort_order' => 12
            ],
        ];

        foreach ($types as $type) {
            DB::table('organization_types')->insert($type);
        }
    }
}
