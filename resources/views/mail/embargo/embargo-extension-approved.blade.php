@extends('mail.layout')

@section('title', 'PCT.eu - Confirmation of embargo extension')
@section('preheader', 'Confirmation of embargo extension.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        We hereby confirm that your request to extend your embargo was approved.
        Therefore, your protocol, {{ $protocol->pct_id }}, entitled "{{ $protocol->title }}", will be under embargo until
        {{ $embargoEndDate->date }}
    </p>
@stop

@section('closing')
    <p>
        We thank you for using Preclinicaltrials.eu and stay available to answer any questions at <a
            href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a>
    </p>
    <p>
        Best regards,<br />
        The PCT Team
    </p>
@stop
