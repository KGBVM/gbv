@php
    $statusColors = [
        'pending' => 'warning',
        'approved' => 'success',
        'rejected' => 'danger',
        'suspended' => 'secondary',
    ];
    $color = $statusColors[$row->status] ?? 'secondary';
@endphp

<span class="badge bg-{{ $color }} bg-opacity-10 text-{{ $color }} px-3 py-2 rounded-pill text-capitalize">
    {{ $row->status }}
</span>
