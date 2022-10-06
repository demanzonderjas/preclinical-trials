@extends('mail.layout')

@section('title', 'PCT.eu - A new contact form has been submitted!')
@section('preheader', 'A new contact form has been submitted.')
@section('name', 'PCT Admin')

@section('content')
    <p>
        A new contact form has been submitted:
    </p>
    <ul>
        <li>Name: {{ $form->name }}</li>
        <li>Email: {{ $form->email }}</li>
        <li>Message: {!! $form->message !!}</li>
    </ul>
@stop

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
