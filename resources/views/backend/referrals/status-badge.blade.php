@php
    $statusColors = [
        'reported' => 'info',
        'under_investigation' => 'warning',
        'medical_attention' => 'primary',
        'legal_proceedings' => 'dark',
        'counselling' => 'secondary',
        'shelter_provided' => 'success',
        'concluded' => 'success',
        'closed' => 'dark',
        'reopened' => 'danger',
    ];
@endphp

<span class="badge bg-{{ $statusColors[$case->status] ?? 'secondary' }}">
    {{ str_replace('_', ' ', ucfirst($case->status)) }}
</span>