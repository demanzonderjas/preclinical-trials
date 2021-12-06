@extends('mail.layout')

@section('title', 'PCT.eu - Your protocol has been rejected and is not published')
@section('preheader', 'Your protocol has been rejected and is not published.')

@section('content')
<p>
    Check out the details of your protocol here:
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