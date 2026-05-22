<div class="d-flex align-items-center">
    <div class="rounded-circle bg-secondary bg-opacity-50 p-1 px-2">
        <i class="bi bi-building fs-5 text-white"></i>
    </div>
    <div class="ms-2">
        <h6 class="m-0">{{ $row->organization_name ?? 'N/A' }}</h6>
        <small class="text-muted">{{ $row->type?->name ?? 'N/A' }}</small>
    </div>
</div>
