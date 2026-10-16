<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormSubmitted;
use App\Models\ContactForm;
use App\Models\FaqItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public const TOPICS = [
        'registering' => 'Registering a protocol',
        'my_protocol' => 'My submitted protocol',
        'embargo' => 'Embargo',
        'account' => 'Account & log in',
        'record' => 'An issue with a published record',
        'newsletter' => 'Newsletter',
        'partnership' => 'Partnership & funding',
        'ambassador' => 'Ambassador programme',
        'press' => 'Press & events',
        'other' => 'Something else',
    ];

    /** The questions shown under "Asked most often", by title. */
    public const FREQUENT = ['Is registration free?', 'What will happen with my submitted protocol?', 'I am unable to edit a record that I have published?'];

    public function show(Request $request): Response
    {
        return Inertia::render('contact', [
            'topics' => collect(self::TOPICS)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values(),
            'frequent' => FaqItem::whereIn('title', self::FREQUENT)->where('status', '!=', 'draft')->get(['id', 'title'])->each->setAppends([])
                ->sortBy(fn ($item) => array_search($item->title, self::FREQUENT))->values(),
            'faqCount' => FaqItem::where('status', '!=', 'draft')->count(),
            'prefill' => [
                'topic' => array_key_exists((string) $request->query('topic'), self::TOPICS) ? $request->query('topic') : null,
                'pct_id' => preg_match('/^PCTE\d+$/i', (string) $request->query('pct_id')) ? strtoupper($request->query('pct_id')) : null,
                'email' => filter_var($request->query('email'), FILTER_VALIDATE_EMAIL) ?: ($request->user()?->email),
                'name' => $request->user()?->name,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'topic' => ['required', Rule::in(array_keys(self::TOPICS))],
            'pct_id' => ['nullable', 'regex:/^PCTE\d+$/i', 'max:20'],
            'message' => ['required', 'string', 'max:2000'],
        ], [
            'pct_id.regex' => 'A PCT ID looks like PCTE0000731.',
        ]);

        $form = new ContactForm();
        $form->name = $data['name'];
        $form->email = $data['email'];
        $form->topic = $data['topic'];
        $form->pct_id = isset($data['pct_id']) ? strtoupper($data['pct_id']) : null;
        $form->message = $data['message'];
        $form->save();

        Mail::to(config('pct.admin_mail'))->send(new ContactFormSubmitted($form));

        return back()->with('success', 'Thank you. Your message is on its way to the PCT team; we will reply as soon as possible.');
    }
}
