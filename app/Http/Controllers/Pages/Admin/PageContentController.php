<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Content\PageContent;
use App\Http\Controllers\Controller;
use App\Models\PageContentOverride;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Admin → Content → Pages: the texts of the designed pages (app/Content/Pages). */
class PageContentController extends Controller
{
    /** The pages for the list on the Pages tab. */
    public static function list(): array
    {
        $edits = PageContentOverride::with('editor:id,first_name,last_name')->get()->keyBy('page');

        return collect(PageContent::pages())->map(fn ($schema, $key) => [
            'key' => $key,
            'title' => $schema->title,
            'url' => $schema->url,
            'description' => $schema->description,
            'updated_at' => $edits->get($key)?->updated_at?->toIso8601String(),
            'updated_by' => $edits->get($key)?->editor?->name,
        ])->values()->all();
    }

    /** One page for its editor: the form's schema, its values and the original texts. */
    public static function editor(string $key): ?array
    {
        if (! PageContent::has($key)) {
            return null;
        }
        $schema = PageContent::schema($key);
        $edit = PageContent::lastEdit($key);

        return [
            'key' => $key,
            'title' => $schema->title,
            'url' => $schema->url,
            'description' => $schema->description,
            'sections' => PageContent::describe($key),
            'values' => PageContent::editorValues($key),
            'defaults' => PageContent::editorDefaults($key),
            'questions' => PageContent::questionOptions(),
            'updated_at' => $edit?->updated_at?->toIso8601String(),
            'updated_by' => $edit?->editor?->name,
        ];
    }

    public function update(Request $request, string $page): RedirectResponse
    {
        abort_unless(PageContent::has($page), 404);
        $data = $request->validate(PageContent::rules($page), [], PageContent::attributes($page));
        PageContent::save($page, $data['content'], $request->user());

        return redirect("/admin/content?tab=pages&page=$page")->with('success', 'Page saved.');
    }

    /** An image for a page field; validated here, then named by its path in the page's content. */
    public function image(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:4096', 'dimensions:max_width=6000,max_height=6000']]);
        $filename = time().'-'.Str::random(10).'.'.$request->file('image')->extension();
        $request->file('image')->move(public_path(PageContent::IMAGE_DIR), $filename);

        return response()->json(['src' => '/'.PageContent::IMAGE_DIR."/$filename"]);
    }
}
