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
        @if ($form->topic)
            <li>Topic: {{ \App\Http\Controllers\Pages\ContactController::TOPICS[$form->topic] ?? $form->topic }}</li>
        @endif
        @if ($form->pct_id)
            <li>Related PCT ID: {{ $form->pct_id }}</li>
        @endif
        {{-- Messages are escaped: the form is public. Older messages were rich text, so tags are stripped first. --}}
        <li>Message: {!! nl2br(e(html_entity_decode(strip_tags($form->message)))) !!}</li>
    </ul>
@stop

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
