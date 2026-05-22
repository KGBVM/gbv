@php
    $priorityColors = [
        'low' => 'success',
        'normal' => 'primary',
        'high' => 'warning',
        'critical' => 'danger',
    ];
@endphp

<span class="badge bg-{{ $priorityColors[$row->priority] ?? 'secondary' }}">
    {{ ucfirst($row->priority) }}
</span>
