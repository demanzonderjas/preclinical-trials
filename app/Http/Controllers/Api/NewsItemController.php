<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\NewsItemResource;
use App\Models\NewsItem;

class NewsItemController extends Controller
{

    public function store(Request $request)
    {
        $newsItem = new NewsItem([
            "title" => $request->title,
            "summary" => $request->summary,
            "content" => $request->content,
            "status" => $request->publish_status
        ]);
        $newsItem->save();
        return response()->json(["news_item" => $newsItem->toArray(), "success" => true]);
    }

    public function getViewable()
    {
        $newsItems = NewsItem::where('status', '!=', 'draft')->orderByDesc('updated_at')->get();
        return response()->json(["news_items" => NewsItemResource::collection($newsItems)]);
    }

    public function get($news_item_id)
    {
        $newsItem = NewsItem::find($news_item_id);
        return response()->json(["news_item" => new NewsItemResource($newsItem)]);
    }
}
