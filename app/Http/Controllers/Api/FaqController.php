<?php

namespace App\Http\Controllers\Api;

use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateFaqItemRequest;
use App\Http\Requests\EditFaqItemRequest;

class FaqController extends Controller
{
    public function getByCategory()
    {
        $categories = FaqCategory::with('faqItems')->get();
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

    public function editItem(EditFaqItemRequest $request, $itemId)
    {
        $item = FaqItem::find($itemId);
        $item->fill($request->all());
        $category = FaqCategory::where('name', $request->input('category'))->first();
        $item->faq_category_id = $category->id;
        $item->save();
        return response()->json(["success" => true]);
    }

    public function createItem(CreateFaqItemRequest $request)
    {
        $item = new FaqItem;
        $item->fill($request->all());
        $category = FaqCategory::where('name', $request->input('category'))->first();
        $item->faq_category_id = $category->id;
        $item->save();
        return response()->json(["success" => true]);
    }

    public function deleteItem($itemId)
    {
        $item = FaqItem::find($itemId);
        $item->delete();
        return response()->json(["success" => true]);
    }
}
