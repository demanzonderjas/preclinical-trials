@extends('mail.layout')

@section('title', 'PCT.eu - Amendment to review')
@section('preheader', 'A researcher amended a published protocol')
@section('name', 'PCT team')

@section('content')
    <p>
        <strong>{{ $amendment->user?->name }}</strong> amended the published protocol
        <strong>{{ $amendment->protocol->pct_id }}: {{ $amendment->protocol->title }}</strong>.
        Readers keep seeing the published version until you approve the amendment.
    </p>
    <p><strong>Reason:</strong></p>
    <p style="white-space: pre-line;">{{ $amendment->reason }}</p>
@stop

@section('cta-link', config('app.url') . '/admin/amendments/' . $amendment->id)
@section('cta-text', 'Review the amendment')

@section('closing')
    <p>
        PCT.eu
    </p>
@stop
