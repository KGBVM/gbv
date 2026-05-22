<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Case #{{ $gbvCase->case_number }}</title>
    <link rel="stylesheet" href="{{ public_path('css/gbv-case.css') }}">
</head>

<body>
    <div class="header">
        <h1>Gender-Based Violence Case Report</h1>
        <div class="case-number">{{ $gbvCase->case_number }}</div>
        <div class="generated-info">
            Generated on: {{ $generatedAt }} by {{ $generatedBy }}
        </div>
        <div style="margin-top: 10px;">
            <span class="status-badge status-{{ $gbvCase->status }}">{{ $statusLabel }}</span>

            {{-- Priority Badge with inline color determination --}}
            @php
                $priorityColors = [
                    'low' => 'secondary',
                    'normal' => 'primary',
                    'high' => 'warning',
                    'critical' => 'danger',
                ];
                $priorityColor = $priorityColors[$gbvCase->priority] ?? 'secondary';
                $priorityText = strtoupper($gbvCase->priority ?? 'NORMAL');
            @endphp

            <span class="badge badge-{{ $priorityColor }}" style="margin-left: 10px;">
                {{ $priorityText }} PRIORITY
            </span>
        </div>
    </div>

    <!-- Survivor Information -->
    <div class="section">
        <h2 class="section-title">Survivor Information</h2>
        <table class="info-table">
            <tr>
                <th>Name:</th>
                <td>{{ $gbvCase->survivor->anonymous_name ?? $gbvCase->survivor->full_name ?? 'Anonymous' }}</td>
            </tr>
            <tr>
                <th>Age Bracket:</th>
                <td>{{ $gbvCase->survivor->age_bracket ?? 'Not specified' }}</td>
            </tr>
            <tr>
                <th>Gender:</th>
                <td class="text-capitalize">{{ $gbvCase->survivor->gender ?? 'Not specified' }}</td>
            </tr>
            <tr>
                <th>PWD Status:</th>
                <td>
                    @if($gbvCase->survivor && $gbvCase->survivor->is_pwd)
                        <span class="badge badge-info">Person with Disability</span>
                    @else
                        No
                    @endif
                </td>
            </tr>
            <tr>
                <th>Phone:</th>
                <td>{{ $gbvCase->survivor->phone ?? 'Not provided' }}</td>
            </tr>
        </table>
    </div>

    <div class="grid-2">
        <!-- Incident Details -->
        <div class="section">
            <h2 class="section-title">Incident Details</h2>
            <table class="info-table">
                <tr>
                    <th>Incident Type:</th>
                    <td class="text-capitalize">
                        {{ str_replace('_', ' ', $gbvCase->incident_type) }}
                        @if($gbvCase->incident_type === 'other' && $gbvCase->incident_type_other)
                            - {{ $gbvCase->incident_type_other }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <th>Date & Time:</th>
                    <td>
                        @if($gbvCase->incident_date)
                            {{ \Carbon\Carbon::parse($gbvCase->incident_date)->format('F j, Y') }}
                            @if($gbvCase->incident_time)
                                at {{ $gbvCase->incident_time }}
                            @endif
                        @endif
                    </td>
                </tr>
                <tr>
                    <th>Location:</th>
                    <td>
                        {{ $gbvCase->incident_location ?? 'Not specified' }}
                        @if($gbvCase->incident_village), {{ $gbvCase->incident_village }}@endif
                        @if($gbvCase->incident_ward), {{ $gbvCase->incident_ward }}@endif
                        @if($gbvCase->incident_sub_county), {{ $gbvCase->incident_sub_county }}@endif
                    </td>
                </tr>
                <tr>
                    <th>Police Involvement:</th>
                    <td>
                        @if($gbvCase->reported_to_police)
                            Yes
                            @if($gbvCase->police_station) ({{ $gbvCase->police_station }})@endif
                            @if($gbvCase->ob_number) - OB: {{ $gbvCase->ob_number }}@endif
                        @else
                            No
                        @endif
                    </td>
                </tr>
                <tr>
                    <th>Medical Attention:</th>
                    <td>
                        @if($gbvCase->medical_attention)
                            Yes
                            @if($gbvCase->health_facility) at {{ $gbvCase->health_facility }}@endif
                        @else
                            No
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <!-- Case Management -->
        <div class="section">
            <h2 class="section-title">Case Management</h2>
            <table class="info-table">
                <tr>
                    <th>Primary Officer:</th>
                    <td>{{ $gbvCase->primaryOfficer->name ?? 'Unassigned' }}</td>
                </tr>
                <tr>
                    <th>Created By:</th>
                    <td>{{ $gbvCase->createdBy->name ?? 'Unknown' }}</td>
                </tr>
                <tr>
                    <th>Created At:</th>
                    <td>{{ \Carbon\Carbon::parse($gbvCase->created_at)->format('F j, Y, g:i a') }}</td>
                </tr>
                <tr>
                    <th>Last Updated:</th>
                    <td>{{ \Carbon\Carbon::parse($gbvCase->updated_at)->format('F j, Y, g:i a') }}</td>
                </tr>
                <tr>
                    <th>Confidentiality:</th>
                    <td class="text-capitalize">{{ $gbvCase->confidentiality_level ?? 'Standard' }}</td>
                </tr>
                @if($gbvCase->concluded_at)
                    <tr>
                        <th>Concluded At:</th>
                        <td>{{ \Carbon\Carbon::parse($gbvCase->concluded_at)->format('F j, Y, g:i a') }}</td>
                    </tr>
                    <tr>
                        <th>Conclusion Type:</th>
                        <td class="text-capitalize">{{ str_replace('_', ' ', $gbvCase->conclusion_type ?? '') }}</td>
                    </tr>
                @endif
            </table>
        </div>
    </div>

    <!-- Perpetrator Information -->
    <div class="section">
        <h2 class="section-title">Perpetrator Information</h2>
        @if($gbvCase->perpetrators && count($gbvCase->perpetrators) > 0)
            @foreach($gbvCase->perpetrators as $index => $perp)
                <div class="perpetrator-box">
                    <h6>Perpetrator {{ $index + 1 }}</h6>
                    <table class="info-table">
                        @if($perp->age_range)
                            <tr>
                                <th>Age Range:</th>
                                <td>{{ $perp->age_range }}</td>
                            </tr>
                        @endif
                        @if($perp->gender)
                            <tr>
                                <th>Gender:</th>
                                <td class="text-capitalize">{{ $perp->gender }}</td>
                            </tr>
                        @endif
                        @if($perp->relationship)
                            <tr>
                                <th>Relationship:</th>
                                <td class="text-capitalize">{{ $perp->relationship }}</td>
                            </tr>
                        @endif
                        @if($perp->name_known && $perp->name)
                            <tr>
                                <th>Name:</th>
                                <td>{{ $perp->name }}</td>
                            </tr>
                        @endif
                    </table>
                </div>
            @endforeach
        @else
            <p class="text-muted">No perpetrator information provided</p>
        @endif
    </div>

    @if($gbvCase->description)
        <div class="section">
            <h2 class="section-title">Incident Description</h2>
            <div class="description-box">
                {{ $gbvCase->description }}
            </div>
        </div>
    @endif

    <!-- Case Files -->
    @if($gbvCase->caseFiles && count($gbvCase->caseFiles) > 0)
        <div class="section">
            <h2 class="section-title">Case Files ({{ count($gbvCase->caseFiles) }})</h2>
            <ul class="files-list">
                @foreach($gbvCase->caseFiles as $file)
                    <li>
                        <strong>{{ $file->title ?? $file->original_name }}</strong>
                        <div class="file-meta">
                            Type: {{ str_replace('_', ' ', $file->file_type) ?? 'Unknown' }} |
                            Size: {{ round($file->file_size / 1024, 2) }} KB |
                            Status: {{ str_replace('_', ' ', $file->status) }} |
                            Uploaded: {{ \Carbon\Carbon::parse($file->created_at)->format('F j, Y') }}
                        </div>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Referrals -->
    @if($gbvCase->referrals && count($gbvCase->referrals) > 0)
        <div class="section">
            <h2 class="section-title">Referrals ({{ count($gbvCase->referrals) }})</h2>
            <ul class="referrals-list">
                @foreach($gbvCase->referrals as $referral)
                    <li>
                        <strong>To: {{ $referral->toPartner->organization_name ?? 'Unknown Partner' }}</strong>
                        <div class="file-meta">
                            Type: {{ str_replace('_', ' ', $referral->referral_type) }} |
                            Urgency: {{ strtoupper($referral->urgency) }} |
                            Status: {{ str_replace('_', ' ', $referral->status) }} |
                            Created: {{ \Carbon\Carbon::parse($referral->created_at)->format('F j, Y') }}
                        </div>
                        <div class="small mt-3"><strong>Reason:</strong> {{ $referral->reason }}</div>
                        @if($referral->notes)
                            <div class="small"><strong>Notes:</strong> {{ $referral->notes }}</div>
                        @endif
                        @if($referral->feedback)
                            <div class="small" style="margin-top: 5px; padding: 5px; background-color: #e7f3ff;">
                                <strong>Feedback:</strong> {{ $referral->feedback }}
                            </div>
                        @endif
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Case Notes -->
    @if($gbvCase->notes && count($gbvCase->notes) > 0)
        <div class="section">
            <h2 class="section-title">Case Notes ({{ count($gbvCase->notes) }})</h2>
            <ul class="notes-list">
                @foreach($gbvCase->notes as $note)
                    <li>
                        <strong>{{ $note->createdBy->name ?? 'System' }}</strong>
                        <span class="text-muted small"
                            style="float: right;">{{ \Carbon\Carbon::parse($note->created_at)->format('F j, Y, g:i a') }}</span>
                        <div style="margin-top: 5px;">{{ $note->content }}</div>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif
</body>

</html>