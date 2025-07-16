@extends('mail.layout')

@section('title', 'Your PCT registration: additional details needed before we can publish your protocol')
@section('preheader', 'Your PCT registration: additional details needed before we can publish your protocol')
@section('name', $protocol->user->name)

@section('content')
    <p>
        The publication of your protocol has been declined. See the comments below to see what needs to be changed:
    </p>
    <div>
        {!! $note !!}
    </div>
@stop

@section('cta-link', env('APP_URL') . '/dashboard/edit-protocol/' . $protocol->id)
@section('cta-text', 'Edit protocol')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
