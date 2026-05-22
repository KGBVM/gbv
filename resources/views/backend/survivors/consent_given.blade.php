@if($row->consent_given)
    <span class="badge text-bg-success">Yes</span>
@else
    <span class="badge text-bg-danger">No</span>
@endif