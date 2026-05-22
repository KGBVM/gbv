<?php

namespace App\Imports;

use App\Models\County;
use App\Models\SubCounty;
use App\Models\Ward;
use App\Models\Village;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KenyaAdministrativeUnitsImport implements ToCollection, WithHeadingRow, WithChunkReading, WithValidation
{
    /**
     * Cache for already processed records to avoid duplicate queries
     */
    private array $processedCounties = [];
    private array $processedSubCounties = [];
    private array $processedWards = [];

    /**
     * Generate a unique code for administrative units
     * 
     * @param string $level (county, sub_county, ward, village)
     * @param string $name
     * @param int|null $parentId
     * @return string
     */
    private function generateUniqueCode(string $level, string $name, ?int $parentId = null): string
    {
        // Clean the name and create base code (first 4 letters, uppercase)
        $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', $name);
        $baseCode = strtoupper(substr($cleanName, 0, 4));

        // If name is too short, pad with random letters
        if (strlen($baseCode) < 3) {
            $baseCode = str_pad($baseCode, 3, 'X');
        }

        // Define level configurations
        $configs = [
            'county' => ['prefix' => 'C', 'model' => County::class],
            'sub_county' => ['prefix' => 'SC', 'model' => SubCounty::class],
            'ward' => ['prefix' => 'W', 'model' => Ward::class],
            'village' => ['prefix' => 'V', 'model' => Village::class],
        ];

        $config = $configs[$level] ?? ['prefix' => 'X', 'model' => null];
        $prefix = $config['prefix'];
        $model = $config['model'];

        // Add parent ID if available (for hierarchical uniqueness)
        $parentPart = $parentId ? sprintf('%04d', $parentId) : '0000';

        // Generate code: PREFIX-PARENTPART-BASECODE
        $code = sprintf('%s-%s-%s', $prefix, $parentPart, $baseCode);

        // Check if code exists and make it unique if needed
        if ($model) {
            $counter = 1;
            $originalCode = $code;

            while ($model::where('code', $code)->exists()) {
                $code = $originalCode . '-' . $counter;
                $counter++;

                // Prevent infinite loop
                if ($counter > 100) {
                    $code = $originalCode . '-' . uniqid();
                    break;
                }
            }
        }

        return $code;
    }

    /**
     * Get or create county from cache/database
     */
    private function getOrCreateCounty(string $countyName, ?string $countyCode = null): County
    {
        $cacheKey = strtolower(trim($countyName));

        if (isset($this->processedCounties[$cacheKey])) {
            return $this->processedCounties[$cacheKey];
        }

        $county = County::firstOrCreate(
            ['name' => trim($countyName)],
            ['code' => $countyCode ?? $this->generateUniqueCode('county', $countyName)]
        );

        // If county exists but no code, update it
        if (!$county->code) {
            $county->code = $this->generateUniqueCode('county', $county->name);
            $county->save();
        }

        $this->processedCounties[$cacheKey] = $county;
        return $county;
    }

    /**
     * Get or create sub-county from cache/database
     */
    private function getOrCreateSubCounty(string $subCountyName, County $county, ?string $subCountyCode = null): SubCounty
    {
        $cacheKey = $county->id . '_' . strtolower(trim($subCountyName));

        if (isset($this->processedSubCounties[$cacheKey])) {
            return $this->processedSubCounties[$cacheKey];
        }

        $subCounty = SubCounty::firstOrCreate(
            [
                'name' => trim($subCountyName),
                'county_id' => $county->id
            ],
            [
                'code' => $subCountyCode ?? $this->generateUniqueCode('sub_county', $subCountyName, $county->id)
            ]
        );

        // If sub-county exists but no code, update it
        if (!$subCounty->code) {
            $subCounty->code = $this->generateUniqueCode('sub_county', $subCounty->name, $county->id);
            $subCounty->save();
        }

        $this->processedSubCounties[$cacheKey] = $subCounty;
        return $subCounty;
    }

    /**
     * Get or create ward from cache/database
     */
    private function getOrCreateWard(string $wardName, SubCounty $subCounty, ?string $wardCode = null): Ward
    {
        $cacheKey = $subCounty->id . '_' . strtolower(trim($wardName));

        if (isset($this->processedWards[$cacheKey])) {
            return $this->processedWards[$cacheKey];
        }

        $ward = Ward::firstOrCreate(
            [
                'name' => trim($wardName),
                'sub_county_id' => $subCounty->id
            ],
            [
                'county_id' => $subCounty->county_id,
                'code' => $wardCode ?? $this->generateUniqueCode('ward', $wardName, $subCounty->id)
            ]
        );

        // If ward exists but no code, update it
        if (!$ward->code) {
            $ward->code = $this->generateUniqueCode('ward', $ward->name, $subCounty->id);
            $ward->save();
        }

        $this->processedWards[$cacheKey] = $ward;
        return $ward;
    }

    /**
     * Create village
     */
    private function createVillage(string $villageName, Ward $ward, ?string $villageCode = null): Village
    {
        $village = Village::firstOrCreate(
            [
                'name' => trim($villageName),
                'ward_id' => $ward->id
            ],
            [
                'county_id' => $ward->county_id,
                'sub_county_id' => $ward->sub_county_id,
                'code' => $villageCode ?? $this->generateUniqueCode('village', $villageName, $ward->id)
            ]
        );

        // If village exists but no code, update it
        if (!$village->code) {
            $village->code = $this->generateUniqueCode('village', $village->name, $ward->id);
            $village->save();
        }

        return $village;
    }

    public function collection(Collection $rows): void
    {
        // Filter out empty rows first
        $filteredRows = $rows->filter(function ($row) {
            return !empty($row['county'] ?? null);
        });

        if ($filteredRows->isEmpty()) {
            return;
        }

        // Begin transaction for data integrity
        DB::beginTransaction();

        try {
            foreach ($filteredRows as $index => $row) {
                // Process County
                $county = $this->getOrCreateCounty(
                    $row['county'],
                    $row['county_code'] ?? null
                );

                // Process Sub County if exists
                if (!empty($row['sub_county'] ?? null)) {
                    $subCounty = $this->getOrCreateSubCounty(
                        $row['sub_county'],
                        $county,
                        $row['sub_county_code'] ?? null
                    );

                    // Process Ward if exists
                    if (!empty($row['ward'] ?? null)) {
                        $ward = $this->getOrCreateWard(
                            $row['ward'],
                            $subCounty,
                            $row['ward_code'] ?? null
                        );

                        // Process Village if exists
                        if (!empty($row['village'] ?? null)) {
                            $this->createVillage(
                                $row['village'],
                                $ward,
                                $row['village_code'] ?? null
                            );
                        }
                    }
                }
            }

            DB::commit();

            // Clear caches after successful import
            $this->clearCaches();

        } catch (\Exception $e) {
            DB::rollBack();
            $this->clearCaches();

            Log::error('Kenya Administrative Units Import failed: ' . $e->getMessage(), [
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            throw $e;
        }
    }

    /**
     * Clear internal caches
     */
    private function clearCaches(): void
    {
        $this->processedCounties = [];
        $this->processedSubCounties = [];
        $this->processedWards = [];
    }

    public function chunkSize(): int
    {
        return 200; // Increased for better performance
    }

    public function rules(): array
    {
        return [
            'county' => 'required|string|max:255',
            'sub_county' => 'nullable|string|max:255',
            'ward' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'county_code' => 'nullable|string|max:50',
            'sub_county_code' => 'nullable|string|max:50',
            'ward_code' => 'nullable|string|max:50',
            'village_code' => 'nullable|string|max:50',
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages(): array
    {
        return [
            'county.required' => 'County name is required in row :attribute',
        ];
    }

    /**
     * Prepare rows for validation
     */
    public function prepareForValidation($data, $index)
    {
        // Trim all string values
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = trim($value);
            }
        }

        return $data;
    }
}