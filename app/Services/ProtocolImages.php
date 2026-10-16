<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Images attached to protocol answers, stored in public/images/protocols. The session
 * remembers which files its user uploaded, so only those can be removed again.
 */
class ProtocolImages
{
    public const FOLDER = 'images/protocols';

    public const RULES = ['image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048']];

    private const SESSION_KEY = 'protocol_images.uploaded';

    public static function store(Request $request, UploadedFile $image): string
    {
        $filename = time().'-'.Str::random(16).'.'.$image->extension();
        $image->move(public_path(self::FOLDER), $filename);
        if ($request->hasSession()) {
            $request->session()->push(self::SESSION_KEY, $filename);
        }

        return $filename;
    }

    public static function forget(Request $request, string $filename): bool
    {
        $filename = basename($filename);
        $uploaded = $request->hasSession() ? $request->session()->get(self::SESSION_KEY, []) : [];
        $path = public_path(self::FOLDER).'/'.$filename;

        if (! in_array($filename, $uploaded, true) || ! File::exists($path)) {
            return false;
        }

        File::delete($path);
        $request->session()->put(self::SESSION_KEY, array_values(array_diff($uploaded, [$filename])));

        return true;
    }
}
