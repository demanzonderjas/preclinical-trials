@extends('mail.layout')

@section('title', 'PCT.eu - A new protocol has been submitted for publication!')
@section('preheader', 'A new protocol has been submitted for publication.')
@section('name', 'PCT Admin')

@section('content')
    <p>
        A{{ $protocol->status === 'submitted_for_publication ' ? ' new' : ' ' }}protocol has been
        {{ $protocol->status === 'submitted_for_publication' ? 'submitted' : 'resubmitted' }} for publication.
    </p>
@stop

@section('cta-link', env('APP_URL') . '/admin/protocols/' . $protocol->id)
@section('cta-text', 'View the protocol')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
