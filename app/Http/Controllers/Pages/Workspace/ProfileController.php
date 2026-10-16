<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A2 My profile: personal details, the "publish my name" default (F11), notifications,
 * password and logging out everywhere.
 */
class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('workspace/profile', [
            'profile' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'verified' => $user->hasVerifiedEmail(),
                'role' => $user->role,
                'institution' => $user->institution,
                'city' => $user->city,
                'country' => $user->country,
                'updated_at' => $user->updated_at?->toIso8601String(),
                'since' => $user->created_at?->year,
            ],
            'stats' => [
                'protocols' => $user->protocols()->count(),
                'published' => $user->protocols()->where('status', 'published')->count(),
            ],
            'settings' => [
                'notifications' => ! $user->disable_notifications,
                'publish_name_default' => (bool) $user->publish_name_default,
            ],
            'countries' => collect(config('pct.countries'))->map(fn ($name, $code) => ['value' => $code, 'label' => $name])->values(),
            'roles' => RegisteredUserController::ROLES,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', Rule::in(array_keys(config('pct.countries')))],
        ]);

        $user->fill($data);
        $emailChanged = $user->isDirty('email');
        if ($emailChanged) {
            $user->email_verified_at = null;
        }
        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();

            return redirect('/verify-email')->with('success', 'Saved. Confirm your new email address with the link we just sent.');
        }

        return back()->with('success', 'Your details are saved.');
    }

    /** The switches, which save straight away. */
    public function settings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'notifications' => ['sometimes', 'boolean'],
            'publish_name_default' => ['sometimes', 'boolean'],
        ]);
        $user = $request->user();

        if (array_key_exists('notifications', $data)) {
            Setting::updateOrCreate(['user_id' => $user->id, 'key' => 'disable_notifications'], ['value' => $data['notifications'] ? 0 : 1]);
        }
        if (array_key_exists('publish_name_default', $data)) {
            $user->forceFill(['publish_name_default' => $data['publish_name_default']])->save();
        }

        return back();
    }

    public function password(Request $request): RedirectResponse
    {
        $data = $request->validateWithBag('password', [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults(), 'different:current_password'],
        ]);
        abort_if(strcasecmp($data['password'], $request->user()->email) === 0, 422);

        $request->user()->forceFill(['password' => Hash::make($data['password'])])->save();
        // Other browsers that knew the old password are signed out.
        Auth::logoutOtherDevices($data['password']);

        return back()->with('success', 'Your password is changed. Other devices are logged out.');
    }

    public function logoutEverywhere(Request $request): RedirectResponse
    {
        $request->validateWithBag('logout', ['password' => ['required', 'current_password']]);

        Auth::logoutOtherDevices($request->password);
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('status', 'You are logged out on all devices.');
    }
}
