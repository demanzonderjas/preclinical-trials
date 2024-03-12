@extends('mail.layout')

@section('title', 'PCT.eu - The end date of your protocol is approaching')
@section('preheader', 'Please check your protocol and see if you need to add any details.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        You registered some times ago your protocol at Preclinicaltrials.eu
        We want to inform you that the end date entered for
        protocol {{ $protocol->pct_id }}, entitled "{{ $protocol->title }}" is due in 3 months.
    </p>
    <p>
        Please check if you want to add any information/results about your study.
    </p>
@stop

@section('cta-link', env('APP_URL') . '/dashboard/edit-protocol/' . $protocol->id)
@section('cta-text', 'Check my protocol')

@section('closing')
    <p>
        Best regards,<br />
        The PCT Team
    </p>
@stop
