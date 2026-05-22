<div class="text-start text-nowrap">
    <h6 class="m-0">{{ $row->created_at->format('d M Y') ?? 'N/A' }}</h6>
    <small class="text-muted">{{ $row->created_at->format('g:i a') ?? 'N/A' }}</small>
</div>
