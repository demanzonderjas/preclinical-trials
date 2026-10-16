<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Images attached to protocol answers, stored in public/images/protocols. Files are never
 * deleted when an answer drops them: published versions may still refer to them.
 */
class ProtocolImages
{
    public const FOLDER = 'images/protocols';

    public const RULES = ['image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048']];

    public static function store(UploadedFile $image): string
    {
        $filename = time().'-'.Str::random(16).'.'.$image->extension();
        $image->move(public_path(self::FOLDER), $filename);

        return $filename;
    }
}
