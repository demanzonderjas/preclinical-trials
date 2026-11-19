<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The texts around the account forms: log in, create account, forgot and reset password, verify
 * email (resources/js/pages/auth/*). One schema with a section per page, so the admin list stays
 * short. Form field labels, help texts, button labels, the terms checkbox, flash and status
 * messages ("Link on its way", "A new verification link is on its way") stay in the code.
 */
class AuthPages extends PageSchema
{
    public string $key = 'auth';

    public string $title = 'Account pages';

    public ?string $url = '/login';

    public ?string $description = 'Log in, create account, forgot password, choose a new password and verify email. The forms themselves stay as they are.';

    private const HELPDESK = '<p>Nothing after 10 minutes? Check your spam folder or <a href="/contact">contact the helpdesk</a>.</p>';

    public function sections(): array
    {
        return [
            Section::make('login', 'Log in', [
                Field::text('eyebrow', 'Label above the heading', 'Researcher account')->max(40),
                Field::text('title', 'Heading', 'Welcome back')->max(40),
                Field::textarea('text', 'Text under the heading', 'Log in to register, amend and follow up on your protocols.')->max(160),
                Field::text('register_prompt', 'Text before the create-account link', 'New to PreclinicalTrials.eu?')->max(60),
                Field::link('register_link', 'Create-account link', 'Create your account', '/create-account'),
                Field::text('side_eyebrow', 'Side panel: label above the heading', 'Why an account?')->max(40),
                Field::text('side_title', 'Side panel: heading', 'Your protocols, safely in one place.')->max(70),
                Field::list('reasons', 'Side panel: reasons', [
                    Field::text('text', 'Reason', '')->max(100),
                ], [
                    ['text' => 'Save drafts and finish them whenever you like'],
                    ['text' => 'Import an existing protocol from PRIS (.json) or APAFiS (.xml)'],
                    ['text' => 'Choose an embargo: details go public after one year'],
                    ['text' => 'Talk to the PCT review team, right next to your fields'],
                ])->items(1, 6),
                Field::textarea('side_note', 'Side panel: note at the bottom', 'An account is free of charge. Your name is only published if you choose so.')->max(140),
            ], 'The form labels, “Forgot password?” and “Keep me logged in” are part of the site.'),
            Section::make('register', 'Create account', [
                Field::text('eyebrow', 'Label above the heading', 'Researcher account')->max(40),
                Field::text('title', 'Heading', 'Create your account')->max(40),
                Field::textarea('text', 'Text under the heading', 'Two minutes, then you can register your first protocol. Fields with an asterisk are mandatory.')->max(200),
                Field::textarea('privacy_note', 'Note above the terms', 'These details are only visible to you and the PCT team. On each protocol you decide whether your name is published.')->max(220),
                Field::text('login_prompt', 'Text before the log-in link', 'Already registered?')->max(60),
                Field::link('login_link', 'Log-in link', 'Log in', '/login'),
                Field::text('side_eyebrow', 'Side panel: label above the heading', 'Why do I need an account?')->max(50),
                Field::text('side_title', 'Side panel: heading', 'Your plans need an owner, not a public name.')->max(80),
                Field::textarea('side_text', 'Side panel: text under the heading', 'Every protocol in the register is kept and amended by the account that created it. That is how the audit trail stays trustworthy.')->max(260),
                Field::list('reasons', 'Side panel: reasons', [
                    Field::text('text', 'Reason', '')->max(100),
                ], [
                    ['text' => 'Register protocols, save drafts, submit for review'],
                    ['text' => 'Amend a published protocol, with every change on record'],
                    ['text' => 'Choose an embargo, and request an extension when needed'],
                    ['text' => 'Answer questions from the PCT team and other researchers'],
                ])->items(1, 6),
                Field::text('next_title', 'Side panel: heading of the steps', 'What happens next')->max(50),
                Field::list('steps', 'Side panel: steps', [
                    Field::text('title', 'Step', '')->max(50),
                    Field::text('text', 'Explanation', '')->max(110),
                ], [
                    ['title' => 'Verify your email', 'text' => 'Click the link we send to the address you entered'],
                    ['title' => 'Start your first protocol', 'text' => 'Fill in the form, or import from PRIS (.json) or APAFiS (.xml)'],
                    ['title' => 'Get a time-stamped PCT ID', 'text' => 'After a check by the PCT team, your protocol is registered'],
                ])->items(1, 4),
            ], 'The form labels, the terms and conditions checkbox and “Create my account” are part of the site.'),
            Section::make('forgot_password', 'Forgot password', [
                Field::text('title', 'Heading', 'Reset your password')->max(50),
                Field::textarea('text', 'Text under the heading', 'Two quick steps and you are back to your protocols. Your drafts are safe.')->max(160),
                Field::text('request_eyebrow', 'Step 1: label', 'Request a link')->max(40),
                Field::text('request_title', 'Step 1: heading', 'Which email do you log in with?')->max(60),
                Field::text('request_text', 'Step 1: text', 'We\'ll email you a link to choose a new password.')->max(120),
                Field::text('register_prompt', 'Step 1: text before the create-account link', 'No account yet?')->max(60),
                Field::link('register_link', 'Step 1: create-account link', 'Create your account', '/create-account'),
                Field::text('inbox_eyebrow', 'Step 2: label', 'Check your inbox')->max(40),
                Field::text('inbox_title', 'Step 2: heading before sending', 'Then check your inbox')->max(50),
                Field::text('inbox_text', 'Step 2: text before sending', 'The email contains a link to choose a new password.')->max(120),
                Field::list('steps', 'Step 2: what to do in the email', [
                    Field::text('text', 'Step', '')->max(70),
                ], [
                    ['text' => 'Open the email from PreclinicalTrials.eu'],
                    ['text' => 'Click “Choose a new password” and pick one'],
                    ['text' => 'Log in, and you are back on your dashboard'],
                ])->items(1, 4),
                Field::rich('help', 'Step 2: help note', self::HELPDESK)->max(200),
            ], 'The texts after sending (“Link on its way”) and the privacy line under the steps are part of the site.'),
            Section::make('reset_password', 'Choose a new password', [
                Field::text('title', 'Heading', 'Choose a new password')->max(50),
                Field::textarea('text', 'Text under the heading', 'Pick one you don’t use anywhere else. You’ll log in with it straight after.')->max(160),
            ], 'Opened from the link in the reset email.'),
            Section::make('verify_email', 'Verify email', [
                Field::text('eyebrow', 'Label above the heading', 'Step 1 of 3')->max(40),
                Field::text('title', 'Heading', 'Verify your email')->max(50),
                Field::textarea('text', 'Text under the heading', 'We sent a link to {email}. Click it to finish creating your account, then you can register your first protocol.')->max(220)
                    ->help('{email} becomes the researcher’s email address, in bold.'),
                Field::rich('help', 'Help note', self::HELPDESK)->max(200),
            ], 'Shown after creating an account, until the email address is verified.'),
        ];
    }
}
