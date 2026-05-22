<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        /**
         * =========================================================
         * GBV CASES
         * =========================================================
         */
        Schema::create('gbv_cases', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('partner_id')->constrained();
            $table->foreignId('survivor_id')->constrained()->cascadeOnDelete();

            $table->foreignId('county_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('sub_county_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('primary_officer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('concluded_by')->nullable()->constrained('users')->nullOnDelete();

            // Identification
            $table->string('case_number')->unique();
            $table->string('incident_number')->nullable()->unique();

            // Incident
            $table->enum('incident_type', [
                'rape',
                'defilement',
                'physical_assault',
                'emotional_abuse',
                'economic_abuse',
                'child_marriage',
                'fgm',
                'cyberbullying',
                'stalking',
                'sexual_harassment',
                'other'
            ]);

            $table->string('incident_type_other')->nullable();

            $table->date('incident_date')->nullable();
            $table->time('incident_time')->nullable();
            $table->string('incident_location')->nullable();

            $table->text('description');

            // Police
            $table->boolean('reported_to_police')->default(false);
            $table->string('police_station')->nullable();
            $table->string('ob_number')->nullable();

            // Medical
            $table->boolean('medical_attention')->default(false);
            $table->string('health_facility')->nullable();

            // Status
            $table->enum('status', [
                'reported',
                'under_investigation',
                'medical_attention',
                'legal_proceedings',
                'counselling',
                'shelter_provided',
                'concluded',
                'closed',
                'reopened'
            ])->default('reported');

            $table->enum('priority', [
                'low',
                'normal',
                'high',
                'critical'
            ])->default('normal');

            // Conclusion
            $table->enum('conclusion_type', [
                'successful_prosecution',
                'out_of_court_settlement',
                'referred_to_other_agency',
                'survivor_declined_further_action',
                'insufficient_evidence',
                'survivor_relocated',
                'other'
            ])->nullable();

            $table->text('conclusion_notes')->nullable();
            $table->timestamp('concluded_at')->nullable();

            // Confidentiality
            $table->boolean('is_sensitive')->default(false);

            $table->enum('confidentiality_level', [
                'standard',
                'confidential',
                'restricted'
            ])->default('standard');

            $table->boolean('consent_obtained')->default(true);
            $table->text('consent_details')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'priority']);
            $table->index(['incident_type', 'status']);
            $table->index(['incident_date', 'incident_type']);
            $table->index(['county_id', 'incident_type', 'status']);
            $table->index(['survivor_id', 'status']);
        });

        /**
         * =========================================================
         * CASE FILES
         * =========================================================
         */
        Schema::create('case_files', function (Blueprint $table) {
            $table->id();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('parent_file_id')->nullable()->constrained('case_files')->cascadeOnDelete();

            $table->string('file_number')->unique();

            $table->enum('file_type', [
                'police_report',
                'medical_report',
                'counselling_notes',
                'legal_document',
                'shelter_intake',
                'statement',
                'evidence',
                'court_document',
                'referral_form',
                'other'
            ]);

            $table->string('title');
            $table->text('description')->nullable();

            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('encryption_key')->nullable();

            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'approved',
                'rejected',
                'archived'
            ])->default('draft');

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();

            $table->longText('audio_transcription')->nullable();
            $table->json('transcription_metadata')->nullable();

            $table->unsignedInteger('version')->default(1);
            $table->json('shared_with')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['gbv_case_id', 'file_type']);
            $table->index(['gbv_case_id', 'status']);
            $table->index(['partner_id', 'status']);
        });

        /**
         * =========================================================
         * REFERRALS
         * =========================================================
         */
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();

            $table->string('referral_number')->unique();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('case_file_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('from_partner_id')->constrained('partners');
            $table->foreignId('to_partner_id')->constrained('partners');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('referral_type', [
                'medical',
                'legal',
                'police',
                'shelter',
                'counselling',
                'economic_empowerment',
                'other'
            ]);

            $table->text('reason');
            $table->json('services_requested')->nullable();

            $table->enum('status', [
                'pending',
                'accepted',
                'declined',
                'completed',
                'cancelled'
            ])->default('pending');

            $table->enum('urgency', ['routine', 'urgent', 'emergency'])->default('routine');

            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('feedback')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['from_partner_id', 'status']);
            $table->index(['to_partner_id', 'status']);
        });

        /**
         * =========================================================
         * PERPETRATORS
         * =========================================================
         */
        Schema::create('perpetrators', function (Blueprint $table) {
            $table->id();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name')->nullable();
            $table->boolean('name_known')->default(false);

            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('age_range')->nullable();

            $table->string('relationship')->nullable();
            $table->string('relationship_to_survivor')->nullable();
            $table->text('relationship_details')->nullable();

            $table->json('physical_description')->nullable();
            $table->json('identifying_features')->nullable();

            $table->boolean('is_repeat_offender')->default(false);
            $table->unsignedInteger('previous_incidents_count')->nullable();

            $table->text('additional_info')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['gbv_case_id', 'gender']);
        });

        /**
         * =========================================================
         * CASE NOTES
         * =========================================================
         */
        Schema::create('case_notes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            $table->text('content');

            $table->enum('type', [
                'general',
                'follow_up',
                'assessment',
                'referral_note',
                'counselling_note',
                'legal_note',
                'medical_note',
                'safety_plan',
                'progress_note',
                'other'
            ])->default('general');

            $table->boolean('is_private')->default(false);
            $table->boolean('is_important')->default(false);

            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['gbv_case_id', 'type']);
            $table->index(['created_by', 'created_at']);
        });

        /**
         * =========================================================
         * CASE TIMELINES
         * =========================================================
         */
        Schema::create('case_timelines', function (Blueprint $table) {
            $table->id();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['gbv_case_id', 'type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_timelines');
        Schema::dropIfExists('case_notes');
        Schema::dropIfExists('perpetrators');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('case_files');
        Schema::dropIfExists('gbv_cases');
    }
};
