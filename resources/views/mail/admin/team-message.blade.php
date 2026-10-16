@extends('mail.layout')

@section('title', 'PCT.eu - New message from ' . $teamMessage->user->name)
@section('preheader', 'A researcher wrote to the PCT team')
@section('name', 'PCT team')

@section('content')
    <p>
        <strong>{{ $teamMessage->user->name }}</strong> ({{ $teamMessage->user->institution }}) wrote
        @if ($teamMessage->channel->feedbackPoint)
            about a feedback point on <strong>{{ $teamMessage->channel->protocol?->title }}</strong>:
        @elseif ($teamMessage->channel->protocol)
            about <strong>{{ $teamMessage->channel->protocol->title }}</strong>:
        @else
            to the PCT team:
        @endif
    </p>
    <p style="white-space: pre-line;">{{ \App\Services\Inbox::plain($teamMessage->text) }}</p>
@stop

@section('cta-link', config('app.url') . '/admin')
@section('cta-text', 'Open the admin area')

@section('closing')
    <p>
        PCT.eu
    </p>
@stop
