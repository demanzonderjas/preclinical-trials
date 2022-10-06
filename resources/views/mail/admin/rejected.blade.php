@extends('mail.layout')

@section('title', 'PCT.eu - Your protocol has been rejected and is not published')
@section('preheader', 'Your protocol has been rejected and is not published.')
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
