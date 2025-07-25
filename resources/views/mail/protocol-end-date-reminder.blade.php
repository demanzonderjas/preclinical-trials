@extends('mail.layout')

@section('title', 'PCT.eu - The end date of your protocol has its anticipated completion date passed')
@section('preheader', 'Please check your protocol and see if you need to add any details.')
@section('name', $protocol->user->name)

@section('content')
    <p>
        Your study protocol entitled "{{ $protocol->title }}" registered under number {{ $protocol->pct_id }} has its
        anticipated completion date passed.
    </p>
    <p>
        To ensure the accuracy of the information provided in your protocol, could you please update it on the platform and
        modify the following items to indicate:
    </p>
    <ul>
        <li>The current state of the study (item 6)</li>
        <li>If your study is not yet completed, please change your expected end date to a more plausible date (item 5).</li>
        <li>
            If anything else changed in the study since its registration, don’t forget to
            amend the corresponding items to provide transparent information.
        </li>
    </ul>
    <p style='background-color:#FFC5AF;padding:5px'>
        If you have unpublished results, we highly recommend you submit them on the <a
            href='https://www.fc3r.com/en/FC3R-short-notes.php'><strong>FC3R Short Note website</strong></a> – a
        peer-reviewed platform disseminating unpublished results. You'll get the same recognition as a peer-reviewed
        journal. You can add the resulting DOI to your Preclinicaltrials.eu's protocol in item 26.
    </p>
@stop

@section('cta-link', env('APP_URL') . '/dashboard/edit-protocol/' . $protocol->id)
@section('cta-text', 'Go to your protocol')

@section('closing')
    <p>
        For step-by-step guidance to amend your protocol, please refer yourself to our <a
            href='https://drive.google.com/file/d/1I-lcjDIxvVlAW3EyO7CatPdcL6OyBrhB/view?pli=1'>"how to" document</a> or
        e-mail us at
        <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a>
    </p>
    <p>
        We remain available if you have any questions,<br />
        Thank you again for using the Preclinicaltrials.eu Platform!
    </p>
    <p>
        The PCT Team
    </p>
@stop
