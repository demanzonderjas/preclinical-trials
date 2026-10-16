@extends('mail.layout')

@section('title', $approved ? 'PCT.eu - Your amendment is published' : 'PCT.eu - Your amendment needs changes')
@section('preheader', $approved ? 'Your amendment is published' : 'Your amendment needs changes')
@section('name', $amendment->protocol->user->name)

@section('content')
    @if ($approved)
        <p>
            The PCT team approved your amendment to <strong>{{ $amendment->protocol->pct_id }}: {{ $amendment->protocol->title }}</strong>.
            The changes are now public and listed in the protocol's version history.
        </p>
    @else
        <p>
            The PCT team returned your amendment to <strong>{{ $amendment->protocol->pct_id }}: {{ $amendment->protocol->title }}</strong>.
            The published version stays as it was. Please see their message:
        </p>
        <p style="white-space: pre-line;">{{ $amendment->message }}</p>
    @endif
@stop

@section('cta-link', config('app.url') . ($approved ? '/database/view-protocol/' : '/dashboard/edit-protocol/') . $amendment->protocol->id)
@section('cta-text', $approved ? 'View the protocol' : 'Change the amendment')

@section('closing')
    <p>
        Friendly regards,<br />
        PCT.eu
    </p>
@stop
