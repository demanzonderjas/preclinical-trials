<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ambassador;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Models\NewsItem;
use App\Models\Page;
use App\Support\Html;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** A2 admin content: news, questions and answers, pages and ambassadors. */
class ContentController extends Controller
{
    private const TABS = ['news', 'faq', 'pages', 'ambassadors'];

    public function index(Request $request): Response
    {
        $tab = in_array($request->query('tab'), self::TABS, true) ? $request->query('tab') : 'news';

        return Inertia::render('admin/content', [
            'tab' => $tab,
            'counts' => [
                'news' => NewsItem::count(),
                'faq' => FaqItem::count(),
                'pages' => Page::count(),
                'ambassadors' => Ambassador::count(),
            ],
            'news' => $tab === 'news' ? NewsItem::orderByRaw('publish_date is null desc')->orderByDesc('publish_date')->orderByDesc('id')->get()->map(fn (NewsItem $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'summary' => $n->summary,
                'content' => $n->content,
                'image' => $n->image,
                'category' => $n->category,
                'status' => $n->status,
                'publish_date' => $n->publish_date ? substr((string) $n->publish_date, 0, 10) : null,
                'updated_at' => $n->updated_at?->toIso8601String(),
            ]) : [],
            'categories' => collect(NewsItem::CATEGORIES)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values(),
            'faq' => $tab === 'faq' ? FaqCategory::orderBy('order')->orderBy('id')->get()->map(fn (FaqCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'items' => FaqItem::where('faq_category_id', $category->id)->orderBy('order')->orderBy('id')->get()->map(fn (FaqItem $item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'status' => $item->status,
                    'audiences' => $item->audience_list,
                    'category_id' => $item->faq_category_id,
                    'updated_at' => $item->updated_at?->toIso8601String(),
                ]),
            ]) : [],
            'audiences' => collect(FaqItem::AUDIENCES)->map(fn ($info, $key) => ['value' => $key, 'label' => $info[0]])->values(),
            'pages' => $tab === 'pages' ? Page::orderBy('id')->get()->map(fn (Page $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'subtitle' => $page->subtitle,
                'slug' => $page->slug,
                'blocks' => collect($page->content_blocks ?? [])->map(fn ($block) => is_string($block) ? $block : (data_get($block, 'content') ?? data_get($block, 'text') ?? ''))->values(),
                'updated_at' => $page->updated_at?->toIso8601String(),
            ]) : [],
            'ambassadors' => $tab === 'ambassadors' ? Ambassador::orderBy('id')->get()->map(fn (Ambassador $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'description' => $a->description,
                'place' => $a->geo_search,
                'latitude' => $a->latitude,
                'longitude' => $a->longitude,
            ]) : [],
        ]);
    }

    /* News ------------------------------------------------------------------ */

    public function saveNews(Request $request, ?int $id = null): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string', 'max:20000'],
            'content' => ['required', 'string', 'max:200000'],
            'image' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z0-9._-]+$/'],
            'category' => ['nullable', Rule::in(array_keys(NewsItem::CATEGORIES))],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'publish_date' => ['nullable', 'date'],
        ]);
        $item = $id ? NewsItem::findOrFail($id) : new NewsItem();
        $item->fill([...$data, 'summary' => Html::clean($data['summary']), 'content' => Html::clean($data['content'])])->save();

        return redirect("/admin/content?tab=news&edit={$item->id}")->with('success', 'News item saved.');
    }

    public function destroyNews(int $id): RedirectResponse
    {
        NewsItem::findOrFail($id)->delete();

        return redirect('/admin/content?tab=news')->with('success', 'News item deleted.');
    }

    /* Questions and answers -------------------------------------------------- */

    public function saveFaq(Request $request, ?int $id = null): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:100000'],
            'category_id' => ['required', 'integer', 'exists:faq_categories,id'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'audiences' => ['array'],
            'audiences.*' => [Rule::in(array_keys(FaqItem::AUDIENCES))],
        ]);
        $item = $id ? FaqItem::findOrFail($id) : new FaqItem();
        $item->fill(['title' => $data['title'], 'content' => Html::clean($data['content']), 'status' => $data['status'], 'audiences' => array_values($data['audiences'] ?? [])]);
        if (! $id || $item->faq_category_id !== (int) $data['category_id']) {
            $item->order = (int) FaqItem::where('faq_category_id', $data['category_id'])->max('order') + 1;
        }
        $item->faq_category_id = $data['category_id'];
        $item->save();

        return redirect("/admin/content?tab=faq&edit={$item->id}")->with('success', 'Question saved.');
    }

    public function destroyFaq(int $id): RedirectResponse
    {
        FaqItem::findOrFail($id)->delete();

        return redirect('/admin/content?tab=faq')->with('success', 'Question deleted.');
    }

    /** The new order of the questions in one category. */
    public function orderFaq(Request $request, int $category): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];
        DB::transaction(function () use ($ids, $category) {
            foreach (array_values($ids) as $position => $id) {
                FaqItem::where(['id' => $id, 'faq_category_id' => $category])->update(['order' => $position]);
            }
        });

        return back();
    }

    /* Pages ----------------------------------------------------------------- */

    public function savePage(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'blocks' => ['array'],
            'blocks.*' => ['nullable', 'string', 'max:200000'],
        ]);
        $page = Page::findOrFail($id);
        $page->title = $data['title'];
        $page->subtitle = $data['subtitle'] ?? '';
        $page->content_blocks = collect($data['blocks'] ?? [])->map(fn ($html) => ['type' => 'text', 'content' => Html::clean($html)])->filter(fn ($block) => $block['content'] !== '')->values()->all();
        $page->save();

        return redirect("/admin/content?tab=pages&edit={$page->id}")->with('success', 'Page saved.');
    }

    /* Ambassadors ------------------------------------------------------------- */

    public function saveAmbassador(Request $request, ?int $id = null): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'place' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);
        $ambassador = $id ? Ambassador::findOrFail($id) : new Ambassador();
        $ambassador->fill(['name' => $data['name'], 'description' => $data['description'], 'geo_search' => $data['place'], 'latitude' => (string) $data['latitude'], 'longitude' => (string) $data['longitude']])->save();

        return redirect("/admin/content?tab=ambassadors&edit={$ambassador->id}")->with('success', 'Ambassador saved.');
    }

    public function destroyAmbassador(int $id): RedirectResponse
    {
        Ambassador::findOrFail($id)->delete();

        return redirect('/admin/content?tab=ambassadors')->with('success', 'Ambassador removed.');
    }

    /* Images ------------------------------------------------------------------ */

    /** News images and images in rich text, stored where the public news page reads them. */
    public function image(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:4096']]);
        $filename = time().'-'.Str::random(10).'.'.$request->file('image')->extension();
        $request->file('image')->move(public_path('images/news'), $filename);

        return response()->json(['filename' => $filename, 'url' => "/images/news/$filename"]);
    }
}
