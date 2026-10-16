<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProtocolImages;
use Illuminate\Http\Request;

class ProtocolImageController extends Controller
{
    const FOLDER = ProtocolImages::FOLDER;

    public function upload(Request $request)
    {
        $request->validate(ProtocolImages::RULES);

        return response()->json(["success" => true, "filename" => ProtocolImages::store($request, $request->file('image'))]);
    }

    /**
     * Only removes images uploaded in this session: published protocols and their history
     * keep referring to older files, and anyone could name someone else's file before.
     */
    public function delete(Request $request)
    {
        return response()->json(["success" => ProtocolImages::forget($request, (string) $request->filename)]);
    }
}
