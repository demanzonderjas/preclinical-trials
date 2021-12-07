<?php

namespace App\Http\Controllers\Api;

use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function store(Request $request)
    {
        $faqItem = new FaqItem([
            "title" => $request->title,
            "content" => $request->content,
            "status" => $request->status
        ]);
        $faqItem->faq_category_id = $request->faq_category_id;
        $faqItem->save();
        return response()->json(["faq_item" => $faqItem->toArray(), "success" => true]);
    }

    public function update(Request $request)
    {
        $faqItem = FaqItem::findOrFail($request->faq_item_id);
        $faqItem->title = $request->title;
        $faqItem->content = $request->content;
        $faqItem->status = $request->status;
        $faqItem->faq_category_id = $request->faq_category_id;
        $faqItem->save();

        return response()->json(["faq_item" => $faqItem->toArray()]);
    }

    public function get($faq_item_id)
    {
        $faqItem = FaqItem::find($faq_item_id);
        return response()->json(["faq_item" => $faqItem->toArray()]);
    }

    public function delete($faq_item_id)
    {
        FaqItem::destroy($faq_item_id);
        return response()->json(["success" => true]);
    }

    public function getByCategory()
    {
        $categories = FaqCategory::with('faqItems')->get();
        return response()->json(["success" => true, "categories" => $categories->toArray()]);
    }

    public function getCategories()
    {
        $categories = FaqCategory::all();
        return response()->json(["success" => true, "categories" => $categories->toArray()]);
    }


    public function getAllItems()
    {
        $items = FaqItem::all();
        return response()->json(["success" => true, "items" => $items->toArray()]);
    }

    public function getItemById($itemId)
    {
        $item = FaqItem::find($itemId);
        return response()->json(["success" => true, "item" => $item->toArray()]);
    }
}
