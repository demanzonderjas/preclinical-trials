@extends('mail.layout')

@section('title', 'PCT.eu - Please update your profile')
@section('preheader', 'The Preclinicaltrials.eu platform has made an update to streamline the preregistration process.')
@section('name', $user->name)

@section('content')
    <p>The Preclinicaltrials.eu platform has made an update to streamline the preregistration process, making it faster and
        more efficient!</p>
    <p>To take full advantage of this improvement, simply update your profile with some additional information:</p>
    <ul>
        <li>Add your role/position</li>
        <li>Include the City and Country where you are affiliated</li>
    </ul>
    <p>
        This information will be automatically mapped to your future protocols, eliminating the need for repetitive data
        entry and enabling quicker registration. Rest assured, your personal details, such as your name, position, and
        email, will remain private and hidden from other users, ensuring confidentiality, just as before.
    </p>
    <p>
        Add your extra information at the following link:
    </p>
@stop

@section('cta-link', env('APP_URL') . '/dashboard/edit-profile')
@section('cta-text', 'Update your profile')

@section('closing')
    <p>
        Thank you for using Preclinicaltrials.eu,<br />
        The PCT Team
    </p>
@stop
