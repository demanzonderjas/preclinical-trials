@extends('pdf.layout')

@section('title', 'PCT statistics')
@section('header-right', 'Statistics')

@php
    $bar = fn ($count, $max) => $max > 0 ? max(1, round($count / $max * 100)) : 0;
@endphp

@section('content')
<p class="eyebrow">Register in numbers</p>
<h1>Statistics</h1>
<p class="muted">Live counts on {{ \Carbon\Carbon::parse($today)->format('j F Y') }}. Breakdowns show public protocols.</p>

<h2>Protocols</h2>
<table class="record">
    <tr><td class="term">Submitted for publication</td><td><strong>{{ $lifecycle['submitted'] }}</strong></td></tr>
    <tr><td class="term">Published</td><td>{{ $lifecycle['published'] }}</td></tr>
    <tr><td class="term">Rejected / needs changes</td><td>{{ $lifecycle['rejected'] }}</td></tr>
    <tr><td class="term">Awaiting review</td><td>{{ $lifecycle['awaiting'] }}</td></tr>
    <tr><td class="term">Under embargo</td><td>{{ $embargo['embargoed'] }}</td></tr>
    <tr><td class="term">Publicly visible</td><td>{{ $embargo['public'] }}</td></tr>
    <tr><td class="term">Registered before start</td><td>{{ $before_start['public'] ? round($before_start['count'] / $before_start['public'] * 100) : 0 }}% ({{ $before_start['count'] }} of {{ $before_start['public'] }})</td></tr>
</table>

@foreach ([
    'Protocols per year' => collect($per_year)->map(fn ($r) => ['label' => $r['year'], 'count' => $r['count']]),
    'Registrations per month (last 12 months)' => collect($per_month)->map(fn ($r) => ['label' => \Carbon\Carbon::parse($r['month'].'-01')->format('M Y'), 'count' => $r['count']]),
    "Protocols by country (top 8 of {$countries['total']})" => collect($countries['top']),
    'Species' => collect($species),
    'Study status' => collect($statuses),
] as $title => $rows)
    <h2>{{ $title }}</h2>
    @php $max = $rows->max('count') ?: 0; @endphp
    <table class="data">
        @foreach ($rows as $row)
            <tr>
                <td style="width: 45mm;">{{ $row['label'] }}</td>
                <td><div style="background: #83B2BA; height: 3mm; width: {{ $bar($row['count'], $max) }}%;"></div></td>
                <td style="width: 15mm; text-align: right;"><strong>{{ $row['count'] }}</strong></td>
            </tr>
        @endforeach
    </table>
@endforeach

<h2>Users</h2>
<table class="record">
    <tr><td class="term">Total users</td><td><strong>{{ $users['total'] }}</strong></td></tr>
    <tr><td class="term">Email verified</td><td>{{ $users['verified'] }}</td></tr>
    <tr><td class="term">Not verified</td><td>{{ $users['unverified'] }}</td></tr>
    <tr><td class="term">Dutch users</td><td>{{ $users['regions']['dutch'] }}</td></tr>
    <tr><td class="term">Utrecht users</td><td>{{ $users['regions']['utrecht'] }}</td></tr>
    <tr><td class="term">Nijmegen users</td><td>{{ $users['regions']['nijmegen'] }}</td></tr>
    <tr><td class="term">Utrecht/Nijmegen protocols</td><td>{{ $users['regions']['utrecht_nijmegen_protocols'] }}</td></tr>
</table>

<h2>Imports</h2>
<table class="record">
    @foreach ($imports['counts'] as $row)
        <tr><td class="term">Imported via {{ $row['source'] }}</td><td>{{ $row['count'] }}</td></tr>
    @endforeach
</table>
@endsection
