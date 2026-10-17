<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Services\TwoFactor;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Setting up and entering the admin area's second factor (EnsureAdminTwoFactor). */
class TwoFactorController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $twoFactor = TwoFactor::for($user);

        if ($request->session()->get(TwoFactor::SESSION_KEY) === $user->id) {
            return redirect()->intended(route('admin.protocols'));
        }

        return Inertia::render('admin/two-factor', [
            'mode' => $twoFactor->enabled() ? 'challenge' : 'setup',
            'qr' => $twoFactor->enabled() ? null : $twoFactor->qrCodeSvg(),
            'secret' => $twoFactor->enabled() ? null : $twoFactor->pendingSecret(),
        ]);
    }

    public function confirm(Request $request)
    {
        $request->validate(['code' => ['required', 'string', 'max:20']]);

        if (! TwoFactor::for($request->user())->confirm($request->input('code'))) {
            return back()->withErrors(['code' => 'That code is not right. Check the time on your phone and try the newest code.']);
        }

        $this->pass($request);

        return redirect()->intended(route('admin.protocols'));
    }

    public function verify(Request $request)
    {
        $request->validate(['code' => ['required', 'string', 'max:20']]);

        if (! TwoFactor::for($request->user())->verify($request->input('code'))) {
            return back()->withErrors(['code' => 'That code is not right. Try the newest code from your app.']);
        }

        $this->pass($request);

        return redirect()->intended(route('admin.protocols'));
    }

    private function pass(Request $request): void
    {
        $request->session()->regenerate();
        $request->session()->put(TwoFactor::SESSION_KEY, $request->user()->id);
    }
}
