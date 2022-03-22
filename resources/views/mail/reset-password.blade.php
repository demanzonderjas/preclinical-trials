@extends('mail.layout')

@section('title', 'PCT.eu - new Preclinicaltrials.eu website')
@section('preheader', 'We are proud to present you the new Preclinicaltrials.eu website.')
@section('name', $name);
@section('content') 
<p>
    We are proud to present you the new Preclinicaltrials.eu website. The platform has been completely remodelled to be user-friendlier, reflect our progress and provide new content/features.
</p>
<p>
	Here are the most significant changes:
</p>
<ul>
<li>Improved overall design and accessibility.</li>
<li>Registration form complies with the ARRIVE essential 10 guidelines and has extensive help to
guide researchers while filling it in.</li>
<li>Improvement of the 'Help' page to facilitate registration.</li>
<li>Improvement of the 'Contact' page, so we can help you whenever you need it.</li>
<li>New content on the background page and home page, including a registration leader board.</li>
</ul>
<p>
As part of the launch, <strong>all users must change their passwords to be able to connect</strong>. Consequently, we would kindly request you to reset your password via the following button: 
</p>
@stop

@section('cta-link', $url)
@section('cta-text', 'Reset my password')

@section('closing')
<p>
Also, we take the opportunity to ask all users to update their records. For instance, if your study has been published, you can now link the URL of your published manuscript to your protocol (also work for preprint or data). Also, if your research has been interrupted, please indicate it. To get further help on how to change your record, please check the 'Help' page.
</p>
<p>
    Looking forward to your future registration,<br />
    The Preclinicaltrials.eu Team
</p>
@stop