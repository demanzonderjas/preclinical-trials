<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProtocolImageController extends Controller
{
    const FOLDER = 'images/protocols';

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $filename = time() . '-' . Str::random(16) . '.' . $request->image->extension();
        $request->image->move(public_path(self::FOLDER), $filename);

        return response()->json(["success" => true, "filename" => $filename]);
    }

    public function delete(Request $request)
    {
        $path = public_path(self::FOLDER) . '/' . basename($request->filename);
        $fileExists = File::exists($path);
        if ($fileExists) {
            File::delete($path);
        }
        return response()->json(["success" => $fileExists]);
    }
}
