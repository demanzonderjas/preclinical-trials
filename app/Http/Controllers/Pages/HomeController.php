<?php

namespace App\Http\Controllers\Pages;

use App\Content\PageContent;
use App\Http\Controllers\Controller;
use App\Services\PublicRegister;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request, PublicRegister $register): Response|RedirectResponse
    {
        // Old links (from the former SPA and its e-mails) send guests to "/?login_to=<path>".
        if ($request->filled('login_to')) {
            $request->session()->put('url.intended', url('/'.ltrim($request->query('login_to'), '/')));

            return redirect()->route('login');
        }

        return Inertia::render('home', [
            // The texts, edited in Admin → Content → Pages (app/Content/Pages/HomePage.php).
            'content' => PageContent::for('home'),
            'figures' => $register->figures(),
            'recent' => $register->summaries()->take(4)->map(fn (array $summary) => PublicRegister::forClient($summary))->values(),
            'updatedOn' => now()->format('j F Y'),
            'videoId' => 'xYjLvDBTsV4',
        ]);
    }
}
