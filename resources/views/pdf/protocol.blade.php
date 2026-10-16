@extends('pdf.layout')

@section('title', $pctId ? "{$pctId}: {$title}" : $title)
@section('header-right', $pctId ?? $status)


@section('content')
<p class="eyebrow">{{ $pctId ? 'Registered protocol' : 'Protocol' }} · {{ $status }}</p>
<h1>{{ $title }}</h1>

<table class="record" style="margin-top: 6mm;">
    @if ($pctId)
        <tr><td class="term">PCT ID</td><td><strong>{{ $pctId }}</strong></td></tr>
    @endif
    @if ($registeredAt)
        <tr><td class="term">Registered</td><td>{{ $registeredAt }}@if ($timing) · {{ $timing['text'] }}@endif</td></tr>
    @endif
    @if ($amendments)
        <tr><td class="term">Amendments</td><td>{{ $amendments }} recorded after registration; this copy shows the current version</td></tr>
    @endif
    <tr><td class="term">Embargo</td><td>{{ $embargo }}</td></tr>
    <tr><td class="term">Copy</td><td>Time-stamped {{ $generated }}</td></tr>
</table>

@foreach ($sections as $section)
    <h2>{{ $section['title'] }}</h2>
    @foreach ($section['fields'] ?? [] as $field)
        @include('pdf.protocol-field', ['field' => $field])
    @endforeach
    @foreach ($section['groups'] ?? [] as $group)
        <h3>{{ $group['title'] }}</h3>
        @foreach ($group['fields'] as $field)
            @include('pdf.protocol-field', ['field' => $field])
        @endforeach
    @endforeach
@endforeach
@endsection
