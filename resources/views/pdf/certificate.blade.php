@extends('pdf.layout')

@section('title', "Registration certificate {$pctId}")
@section('header-right', 'Registration certificate')

@section('content')
<div style="margin-top: 14mm; text-align: center;">
    <p class="eyebrow">Registration certificate</p>
    <p class="pct-id" style="margin: 4mm 0 0;">{{ $pctId }}</p>
    <h1 style="font-size: 15pt; margin: 5mm 18mm 0;">{{ $title }}</h1>
    <p class="muted" style="margin-top: 6mm;">This protocol was registered in the international register of preclinical animal study protocols, PreclinicalTrials.eu.</p>
</div>

<table class="record" style="margin-top: 12mm;">
    <tr><td class="term">Registered</td><td><strong>{{ $registeredAt }}</strong> (time-stamped)</td></tr>
    @if ($startDate)
        <tr><td class="term">Study start</td><td>{{ $startDate }}</td></tr>
    @endif
    @if ($timing)
        <tr><td class="term">Timing</td><td><strong>{{ $timing['text'] }}</strong></td></tr>
    @endif
    @if ($studyStatus)
        <tr><td class="term">Study status</td><td>{{ $studyStatus }}</td></tr>
    @endif
    @if ($centre)
        <tr><td class="term">Study centre</td><td>{{ $centre }}</td></tr>
    @endif
    <tr><td class="term">Embargo</td><td>{{ $embargo }}</td></tr>
    <tr><td class="term">Record</td><td>{{ $url }}</td></tr>
</table>

<p class="note">The registration date is set when the PCT team approves the protocol and cannot be changed afterwards. Later amendments are recorded with their own dates in the protocol's history.</p>
@endsection
