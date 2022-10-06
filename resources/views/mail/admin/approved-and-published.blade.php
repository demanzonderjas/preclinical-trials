@extends('mail.layout')

@section('title', 'PCT.eu - Your protocol has been approved and published!')
@section('preheader', 'Your protocol has been approved and published!')

@section('content')
    <p>
        Your protocol has been approved and published!
    </p>
    <p>
        Your protocol ID is <strong>{{ $protocol->pct_id }}</strong>.<br />
        Your direct protocol URL is: <strong><a
                href="{{ env('APP_URL') . '/database/view-protocol/' . $protocol->id }}">{{ env('APP_URL') . '/database/view-protocol/' . $protocol->id }}</a></strong><br />
    </p>
    <p>
        You can use this ID or the URL of your protocol to refer to your preregistration to your funder and in future
        report/publication
    </p>
@stop

@section('cta-link', env('APP_URL') . '/database/view-protocol/' . $protocol->id)
@section('cta-text', 'View the protocol')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
