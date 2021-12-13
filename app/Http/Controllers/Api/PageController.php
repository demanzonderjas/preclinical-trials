<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Page;

class PageController extends Controller
{

    public function update(Request $request)
    {
        $page = Page::findOrFail($request->page_id);
        $page->title = $request->title;
        $page->slug = $request->slug;
        $page->subtitle = $request->subtitle;
        $page->content = $request->content;
        $page->save();

        return response()->json(["page" => $page->toArray()]);
    }

    public function getAll()
    {
        $pages = Page::all();
        return response()->json(["pages" => $pages->toArray()]);
    }

    public function getById($page_id)
    {
        $page = Page::find($page_id);
        return response()->json(["page" => $page->toArray()]);
    }

    public function getBySlug($slug)
    {
        $page = Page::where('slug', $slug)->first();
        return response()->json(["page" => $page->toArray()]);
    }
}
