<div class="text-center">
    <div class="mb-1">
        <span class="badge bg-success bg-opacity-10 text-success">
            <i class="bi bi-arrow-up me-1"></i> {{ $row?->referrals_stats?->sent ?? 0 }} sent
        </span>
    </div>
    <div>
        <span class="badge bg-warning bg-opacity-10 text-warning">
            <i class="bi bi-arrow-down me-1"></i> {{ $row?->referrals_stats?->received ?? 0 }} received
        </span>
    </div>
</div>
