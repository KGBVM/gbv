{{-- resources/views/referrals/partials/actions.blade.php --}}
@php
    $isReceived = $referral->to_partner_id === auth()->user()->partner_id;
    $isPending = $referral->status === 'pending';
@endphp

<div class="d-flex gap-2 justify-content-end">
    {{-- View --}}
    <button type="button" class="btn btn-link text-primary p-0" data-referral-id="{{ $referral->id }}" title="View">
        <i class="bi bi-eye"></i>
    </button>

    @if($isReceived && $isPending)
        {{-- Accept --}}
        <button type="button" class="btn btn-link text-success p-0" data-referral-id="{{ $referral->id }}" title="Accept">
            <i class="bi bi-check-lg"></i>
        </button>

        {{-- Decline --}}
        <button type="button" class="btn btn-link text-danger p-0" data-referral-id="{{ $referral->id }}" title="Decline">
            <i class="bi bi-x-lg"></i>
        </button>
    @endif

    @if($isReceived && $referral->status === 'accepted')
        {{-- Complete --}}
        <button type="button" class="btn btn-link text-info p-0" data-referral-id="{{ $referral->id }}" title="Complete">
            <i class="bi bi-check-all"></i>
        </button>
    @endif

    @if(!$isReceived && $isPending)
        {{-- Cancel --}}
        <button type="button" class="btn btn-link text-secondary p-0" data-referral-id="{{ $referral->id }}" title="Cancel">
            <i class="bi bi-x-circle"></i>
        </button>
    @endif
</div>