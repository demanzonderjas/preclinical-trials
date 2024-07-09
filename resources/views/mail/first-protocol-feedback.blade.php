@extends('mail.layout')

@section('title', 'PCT.eu - Feedback regarding the protocol publishing process')
@section('preheader', 'Please let us know your feedback about adding and publishing your first protocol.')
@section('name', $user->name)

@section('content')
    <p>
        I am Julia Menon, the daily director of Preclinicaltrials.eu, the international register of animal study
        protocols. Thank you for registering your protocol with us!
    </p>
    <p>
        Our team remains constantly devoted to improving users' experience with our registration platform.
        You recently preregistered one of your protocols with us. Consequently, I would kindly like to invite
        you to fill in a survey about your experience with our
        services: <a href="https://forms.gle/XNrK8DbcX3qJE6NM6">https://forms.gle/XNrK8DbcX3qJE6NM6</a>
    </p>
    <p>
        It will enable us to adapt the platform to provide you and future users with an optimal experience
        and enhance our capacity to facilitate and promote preregistration.
    </p>
    <p>
        To note: all your information will be kept anonymous and confidential. The primary purpose of this
        short survey is internal to preclinicaltrials.eu only and its steering committee.</p>
    <p>
        If you need any extra information, feel free to contact me at this e-mail.
    </p>
@stop

@section('closing')
    <p>
        Thank you in advance,<br />
        Yours Sincerely,<br />
        Julia Menon
    </p>
@stop
