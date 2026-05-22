@php
    $priorityColors = [
        'low' => 'success',
        'normal' => 'primary',
        'high' => 'warning',
        'critical' => 'danger',
    ];
@endphp

<span class="badge bg-{{ $priorityColors[$case->priority] ?? 'secondary' }}">
    {{ ucfirst($case->priority) }}
</span>