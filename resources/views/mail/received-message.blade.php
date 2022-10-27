@extends('mail.layout')

@section('title', "PCT.eu - You've received a new message")
@section('preheader', "You've received a new message")
@section('name', $user->name)

@section('content')
    <p>
        You've received a new message on one of your protocols.
    </p>
@stop

@section('cta-link', env('APP_URL') . '/dashboard/messages/' . $channel_id)
@section('cta-text', 'View message')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
