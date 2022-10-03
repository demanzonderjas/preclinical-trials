@extends('mail.layout')

@section('title', 'PCT.eu - Your embargo has been lifted')
@section('preheader', 'Your embargo has been lifted.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        Your protocol, {{ $protocol->id }}, entitled "{{ $protocol->title }}" is now publicly available on
        Preclinicaltrials.eu.
    </p>
    <p>
        We assume your study progressed since registration or might even be published. Please
        amend your protocol to change the study stage to the current progress (item 6) and add, if
        applicable, the DOI of the manuscript or link to the preprint/data (item 26).
    </p>
@stop

@section('cta-link', env('APP_URL') . '/database/view-protocol/' . $protocol->id)
@section('cta-text', 'Go to your protocol')

@section('closing')
    <p>
        Thank you for using Preclinicaltrials.eu
    </p>
    <p>
        Best regards,<br />
        The PCT Team
    </p>
@stop
