<div class="">
    @foreach (getIncidentTypes() as $incidentType)
        @if ($incidentType['value'] == $row->incident_type)
            <div class="d-flex align-items-center">
                <div class="text-muted me-3">
                    {{ $incidentType['icon'] }}
                </div>
                <div class="fw-semibold">
                    <h6 class="m-0">{{ $incidentType['label'] }}</h6>
                    <small class="text-muted text-capitalize">
                        {{ $incidentType['category'] }}
                    </small>
                </div>
            </div>
        @endif
    @endforeach

</div>
