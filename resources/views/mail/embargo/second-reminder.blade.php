@extends('mail.layout')

@section('title', 'PCT.eu - Your embargo will be lifted in 2 weeks')
@section('preheader', 'Your embargo will be lifted in 2 weeks.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        We want to inform you that your embargo will be automatically lifted in 2 weeks for
        protocol {{ $protocol->id }}, entitled "{{ $protocol->title }}".
    </p>
    <p>
        You should have received a 1st reminder two weeks ago. If you forgot to extend your
        embargo, you can still do so by clicking the button below:
    </p>
@stop

@section('cta-link', env('APP_URL') . '/dashboard/extend-embargo/' . $protocol->id)
@section('cta-text', 'Extend embargo')

@section('closing')
    <p>
        If you do not wish to extend, you can ignore this e-mail, and your embargo will be
        automatically lifted after the {{ $embargoEndDate->date }}.
        If you have any concerns or questions, please e-mail us at <a
            href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a>
    </p>
    <p>
        Best regards,<br />
        The PCT Team
    </p>
@stop
