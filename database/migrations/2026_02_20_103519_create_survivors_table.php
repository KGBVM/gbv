<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survivors', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('partner_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Identification
            $table->string('unique_code')->unique();
            $table->string('full_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('alternate_phone')->nullable();
            $table->enum('gender', ['male', 'female', 'other']);

            // Age disaggregation
            $table->date('dob')->nullable();
            $table->integer('age')->nullable()->index();
            $table->enum('age_bracket', [
                '0-16',
                '17-35',
                '36-60',
                '60+'
            ])->nullable();

            // PWD Status
            $table->boolean('is_pwd')->default(false);
            $table->string('pwd_type')->nullable();
            $table->string('pwd_registration_number')->nullable();

            // Identity documents
            $table->string('id_number')->nullable();
            $table->string('id_type')->nullable();

            // Location hierarchy
            $table->foreignId('county_id')
                ->nullable()
                ->constrained('counties')
                ->nullOnDelete();
            $table->foreignId('sub_county_id')
                ->nullable()
                ->constrained('sub_counties')
                ->nullOnDelete();
            $table->foreignId('ward_id')
                ->nullable()
                ->constrained('wards')
                ->nullOnDelete();
            $table->foreignId('village_id')
                ->nullable()
                ->constrained('villages')
                ->nullOnDelete();

            // Location details
            $table->string('landmark')->nullable();
            $table->json('location_coordinates')->nullable();

            // Consent and anonymity
            $table->boolean('anonymous')->default(false);
            $table->boolean('consent_given')->default(false);
            $table->timestamp('consent_given_at')->nullable();
            $table->json('consent_details')->nullable();

            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();

            // Metadata
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Simple indexes
            $table->index('partner_id');
            $table->index('unique_code');
            $table->index('phone');
            $table->index('county_id');
            $table->index('sub_county_id');
            $table->index('ward_id');
            $table->index('village_id');
            $table->index('age_bracket');
            $table->index('is_pwd');
            $table->index('dob');
            $table->index('gender');
            $table->index('created_by');

            // Compound indexes (optimized naming)
            $table->index(['id_number', 'id_type'], 'idx_survivors_id_doc');
            $table->index(['partner_id', 'id_number', 'id_type'], 'idx_survivors_partner_doc');
            $table->index(['county_id', 'sub_county_id', 'ward_id', 'village_id'], 'idx_survivors_location');
            $table->index(['created_at', 'age_bracket'], 'idx_survivors_created_age');
            $table->index(['county_id', 'created_at'], 'idx_survivors_county_created');
            $table->index(['sub_county_id', 'age_bracket'], 'idx_survivors_subcounty_age');
            $table->index(['ward_id', 'is_pwd'], 'idx_survivors_ward_pwd');
            $table->index(['village_id', 'is_pwd'], 'idx_survivors_village_pwd');
            $table->index(['gender', 'age_bracket'], 'idx_survivors_gender_age');
            $table->index(['county_id', 'gender', 'age_bracket'], 'idx_survivors_county_gender_age');
        });

        // Add virtual column for calculated age (optimized)
        if (Schema::hasTable('survivors') && !app()->runningUnitTests()) {
            DB::statement("
                ALTER TABLE survivors 
                ADD COLUMN age_calculated INT 
                GENERATED ALWAYS AS (TIMESTAMPDIFF(YEAR, dob, CURDATE())) VIRTUAL
            ");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('survivors');
    }
};
