@extends('mail.layout')

@section('title', 'PCT.eu - Your protocol has been submitted for publication!')
@section('preheader', 'Your protocol has been submitted for publication.')

@section('content')
<p>
    Your protocol has been {{ $protocol->status === "submitted_for_publication" ? "submitted" : "resubmitted" }} for publication.
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