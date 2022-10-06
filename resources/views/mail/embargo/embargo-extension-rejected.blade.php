@extends('mail.layout')

@section('title', 'PCT.eu - Your embargo extension has been rejected')
@section('preheader', 'Your embargo extension has been rejected.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        Your embargo extension for the protocol {{ $protocol->pct_id }}, entitled "{{ $protocol->title }}", has been
        rejected.
    </p>
    <p>
        See the comments below to understand why:
    </p>
    <div>
        {!! $note !!}
    </div>
@stop

@section('cta-link', env('APP_URL') . '/database/view-protocol/' . $protocol->id)
@section('cta-text', 'View protocol')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
