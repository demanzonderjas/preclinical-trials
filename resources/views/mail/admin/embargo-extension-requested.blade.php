@extends('mail.layout')

@section('title', 'PCT.eu - An embargo extension has been requested')
@section('preheader', 'An embargo extension has been requested.')
@section('name', 'PCT Admin')

@section('content')
    <p>
        An embargo extension has been requested. View the active embargo extensions below.
    </p>
@stop

@section('cta-link', env('APP_URL') . '/admin/embargo-extensions')
@section('cta-text', 'View the extension request')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
