@extends('mail.layout')

@section('title', 'PCT.eu - Reset password')
@section('preheader', 'You have requested to reset your password.')
@section('name', $name);

@section('content')
    <p>
        You have requested to reset your password. Please do so here:
    </p>
@stop

@section('cta-link', $url)
@section('cta-text', 'Reset my password')

@section('closing')
    <p>
        Friendly regards,<br />
        The Preclinicaltrials.eu Team
    </p>
@stop
