<div class="text-center">
    <div class="mb-1">
        <span class="badge bg-info bg-opacity-10 text-info">
            <i class="bi bi-people me-1"></i> {{ $row?->total_users_count ?? 0 }} users
        </span>
    </div>
    <div>
        <span class="badge bg-primary bg-opacity-10 text-primary">
            <i class="bi bi-folder me-1"></i> {{ $row?->total_cases_count ?? 0 }} cases
        </span>
    </div>
</div>
