{{-- The wording comes from App\Mail\ProtocolDeclined (placeholder copy, swap it there). --}}
@extends('mail.layout')

@section('title', \App\Mail\ProtocolDeclined::SUBJECT)
@section('preheader', \App\Mail\ProtocolDeclined::PREHEADER)
@section('name', $protocol->user->name)

@section('content')
    @foreach (\App\Mail\ProtocolDeclined::INTRO as $paragraph)
        <p>{{ $paragraph }}</p>
    @endforeach
    <p><strong>Protocol:</strong> {{ $protocol->title }}</p>
    <p style="white-space: pre-line;"><strong>Reason:</strong> {{ $reason }}</p>
    @foreach (\App\Mail\ProtocolDeclined::OUTRO as $paragraph)
        <p>{{ $paragraph }}</p>
    @endforeach
@stop

@section('cta-link', config('app.url') . '/dashboard/manage-protocols')
@section('cta-text', \App\Mail\ProtocolDeclined::CTA_TEXT)

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
