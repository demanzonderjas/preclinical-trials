@extends('mail.layout')

@section('title', 'PCT.eu - Your protocol has been submitted for publication!')
@section('preheader', 'Your protocol has been submitted for publication.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        Your protocol has been {{ $protocol->status === 'submitted_for_publication' ? 'submitted' : 'resubmitted' }} for
        publication.
    </p>
    <p>
        Our team will verify your protocol within 10 working days.
    </p>
@stop

@section('cta-link', env('APP_URL') . '/database/view-protocol/' . $protocol->id)
@section('cta-text', 'View your protocol')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
