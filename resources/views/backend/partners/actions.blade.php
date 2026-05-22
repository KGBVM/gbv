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
        @if ($row->status == 'pending')
            {{-- APPROVE BUTTON --}}
            <button class="action-btn btn btn-outline-success" data-action="approve" data-id="{{ $row->id }}">
                <i class="bi bi-check2-circle"></i>
            </button>

            {{-- REJECT BUTTON --}}
            <button class="action-btn btn btn-outline-danger" data-action="reject" data-id="{{ $row->id }}">
                <i class="bi bi-x-circle"></i>
            </button>
        @endif

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
