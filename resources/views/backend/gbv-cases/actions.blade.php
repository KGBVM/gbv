<div class="btn-group btn-group-sm text-nowrap gap-2" role="group">

    @if ($row->trashed())
        {{-- RESTORE --}}
        <button class="action-btn btn btn-outline-success" data-action="restore" data-id="{{ $row->id }}">
            <i class="bi bi-history"></i>
        </button>

        {{-- PERMANENT DELETE --}}
        <button class="action-btn btn btn-outline-danger" data-action="forceDelete" data-id="{{ $row->id }}">
            <i class="bi bi-x-circle"></i>
        </button>
    @else
        {{-- EDIT --}}
        <button class="action-btn btn btn-outline-warning" data-action="edit" data-id="{{ $row->id }}">
            <i class="bi bi-pen"></i>
        </button>

        {{-- MANAGE --}}
        <button class="action-btn btn btn-outline-primary" data-action="view" data-id="{{ $row->id }}">
            <i class="bi bi-eye"></i>
        </button>

        {{-- SOFT DELETE --}}
        <button class="action-btn btn btn-outline-danger" data-action="delete" data-id="{{ $row->id }}">
            <i class="bi bi-trash"></i>
        </button>
    @endif

</div>
