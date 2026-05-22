<?php

namespace Database\Seeders;

use App\Imports\KenyaAdministrativeUnitsImport;
use Illuminate\Database\Seeder;
use Maatwebsite\Excel\Facades\Excel;

class KenyaAdministrativeUnitsSeeder extends Seeder
{
    public function run()
    {
        $path = database_path('seeders/data/Kitui_Villages.xlsx');

        if (!file_exists($path)) {
            $this->command->error("File not found: $path");
            return;
        }

        try {
            Excel::import(new KenyaAdministrativeUnitsImport, $path);
        } catch (\Exception $e) {
            $this->command->error('Import failed: ' . $e->getMessage());
        }
    }
}