<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\NewsItemResource;
use App\Models\NewsItem;
use Illuminate\Support\Facades\File;

class NewsItemController extends Controller
{

    public function store(Request $request)
    {
        $newsItem = new NewsItem([
            "title" => $request->title,
            "summary" => $request->summary,
            "content" => $request->content,
            "image" => $request->image,
            "publish_date" => $request->publish_date,
            "status" => $request->status
        ]);
        $newsItem->save();
        return response()->json(["news_item" => $newsItem->toArray(), "success" => true]);
    }

    public function update(Request $request)
    {
        $newsItem = NewsItem::findOrFail($request->news_item_id);
        $newsItem->title = $request->title;
        $newsItem->summary = $request->summary;
        $newsItem->content = $request->content;
        $newsItem->image = $request->image;
        $newsItem->publish_date = $request->publish_date;
        $newsItem->status = $request->status;
        $newsItem->save();

        return response()->json(["news_item" => new NewsItemResource($newsItem)]);
    }

    public function getViewable()
    {
        $newsItems = NewsItem::where('status', '!=', 'draft')->orderByDesc('updated_at')->get();
        return response()->json(["news_items" => NewsItemResource::collection($newsItems)]);
    }

    public function getViewableForAdmin()
    {
        $newsItems = NewsItem::orderByDesc('updated_at')->get();
        return response()->json(["news_items" => NewsItemResource::collection($newsItems)]);
    }

    public function get($news_item_id)
    {
        $newsItem = NewsItem::find($news_item_id);
        return response()->json(["news_item" => new NewsItemResource($newsItem)]);
    }

    public function delete($news_item_id)
    {
        NewsItem::destroy($news_item_id);
        return response()->json(["success" => true]);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $imageName = time() . '.' . $request->image->extension();

        $request->image->move(public_path('images/news'), $imageName);

        return response()->json(["success" => true, "filename" => $imageName]);
    }

    public function deleteImage(Request $request)
    {
        $image_path = public_path('images/news/') . $request->filename;
        $fileExists = File::exists($image_path);
        if ($fileExists) {
            File::delete($image_path);
        }
        return response()->json(["success" => $fileExists]);
    }
}
