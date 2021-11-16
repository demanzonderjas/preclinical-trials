@extends('mail.layout')

@section('title', 'PCT.eu - A new protocol has been submitted for publication!')
@section('preheader', 'A new protocol has been submitted for publication.')

@section('content')
<p>
    A new protocol has been submitted for publication.
</p>
@stop

@section('cta-link', env('APP_URL') . '/admin/manage-protocols/' . $protocol->id)
@section('cta-text', 'View the protocol')

@section('closing')
<p>
    Friendly regards,<br />
    PCT.eu
</p>
@stop