@extends('mail.layout')

@section('title', 'PCT.eu - More information needed for your protocol')
@section('preheader', 'The PCT team needs a little more information before your protocol can be published.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        Thank you for submitting your protocol. Before we can publish it, we need some more information.
        The comments below explain what to add or clarify. Once you have updated your protocol, you can resubmit it.
    </p>
    <div>
        {!! $note !!}
    </div>
@stop

@section('cta-link', config('app.url') . '/dashboard/edit-protocol/' . $protocol->id)
@section('cta-text', 'Update protocol')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
