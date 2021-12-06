@extends('mail.layout')

@section('title', 'PCT.eu - Your protocol has been approved and published!')
@section('preheader', 'Your protocol has been approved and published!')

@section('content')
<p>
    Your protocol has been approved and published!
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