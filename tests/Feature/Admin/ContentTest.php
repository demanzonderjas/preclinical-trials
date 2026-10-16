<?php

namespace Tests\Feature\Admin;

use App\Models\Ambassador;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Models\NewsItem;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ContentTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_news_is_created_cleaned_and_edited(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->post('/admin/content/news', [
            'title' => 'Presentation at EUSAAT',
            'summary' => '<p>We presented <script>alert(1)</script>preregistration.</p>',
            'content' => '<p onclick="steal()">Well <a href="javascript:alert(1)">received</a>.</p>',
            'status' => 'published',
            'publish_date' => '2024-11-11',
            'category' => 'events',
        ])->assertRedirect();

        $item = NewsItem::firstOrFail();
        $this->assertSame('<p>We presented preregistration.</p>', $item->summary);
        $this->assertSame('<p>Well <a>received</a>.</p>', $item->content);
        $this->get('/news')->assertInertia(fn (Assert $page) => $page->where('featured.title', 'Presentation at EUSAAT'));

        $this->actingAs($admin)->put("/admin/content/news/{$item->id}", ['title' => 'Renamed', 'summary' => '<p>S</p>', 'content' => '<p>C</p>', 'status' => 'draft'])->assertRedirect();
        $this->assertSame('Renamed', $item->fresh()->title);
        $this->actingAs($admin)->post('/admin/content/news', ['title' => 'x', 'summary' => 's', 'content' => 'c', 'status' => 'secret'])->assertSessionHasErrors('status');

        $this->actingAs($admin)->delete("/admin/content/news/{$item->id}")->assertRedirect('/admin/content?tab=news');
        $this->assertSame(0, NewsItem::count());
    }

    public function test_questions_are_saved_with_audiences_and_reordered(): void
    {
        $admin = $this->makeAdmin();
        $category = new FaqCategory();
        $category->name = 'Registration';
        $category->save();

        foreach (['First?', 'Second?', 'Third?'] as $title) {
            $this->actingAs($admin)->post('/admin/content/faq', ['title' => $title, 'content' => '<p>Yes.</p>', 'category_id' => $category->id, 'status' => 'published', 'audiences' => ['researcher']])->assertRedirect();
        }
        $ids = FaqItem::orderBy('order')->pluck('id')->all();
        $this->assertSame(['researcher'], FaqItem::find($ids[0])->audience_list);

        $this->actingAs($admin)->put("/admin/content/faq-categories/{$category->id}/order", ['ids' => array_reverse($ids)])->assertRedirect();

        $this->assertSame(['Third?', 'Second?', 'First?'], FaqItem::orderBy('order')->pluck('title')->all());
        $this->get('/help?for=researcher')->assertInertia(fn (Assert $page) => $page->where('items.0.title', 'Third?'));
    }

    public function test_pages_and_ambassadors_are_edited(): void
    {
        $admin = $this->makeAdmin();
        $page = new Page();
        $page->title = 'Disclaimer';
        $page->slug = '/disclaimer';
        $page->content_blocks = [['type' => 'text', 'content' => '<p>Old</p>']];
        $page->save();

        $this->actingAs($admin)->put("/admin/content/pages/{$page->id}", ['title' => 'Disclaimer', 'subtitle' => '', 'blocks' => ['<p>New text</p>', '']])->assertRedirect();
        $this->assertSame([['type' => 'text', 'content' => '<p>New text</p>']], json_decode(json_encode($page->fresh()->content_blocks), true));

        $this->actingAs($admin)->post('/admin/content/ambassadors', ['name' => 'Dr. Emily Sena', 'description' => 'Senior lecturer', 'place' => 'Edinburgh, United Kingdom', 'latitude' => '55.953', 'longitude' => '-3.188'])->assertRedirect();
        $this->assertSame('Edinburgh, United Kingdom', Ambassador::firstOrFail()->geo_search);
        $this->actingAs($admin)->post('/admin/content/ambassadors', ['name' => 'X', 'description' => 'Y', 'place' => 'Z', 'latitude' => '123', 'longitude' => '0'])->assertSessionHasErrors('latitude');
    }

    public function test_images_are_uploaded_but_not_svg(): void
    {
        $admin = $this->makeAdmin();

        $url = $this->actingAs($admin)->postJson('/admin/content/images', ['image' => UploadedFile::fake()->image('slide.png')])->assertOk()->json('url');
        $this->assertFileExists(public_path($url));
        unlink(public_path($url));

        $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
        $this->actingAs($admin)->postJson('/admin/content/images', ['image' => $svg])->assertUnprocessable();
    }

    public function test_the_content_page_lists_the_chosen_tab(): void
    {
        $admin = $this->makeAdmin();
        NewsItem::create(['title' => 'A', 'status' => 'draft']);

        $this->actingAs($admin)->get('/admin/content')->assertInertia(fn (Assert $page) => $page->component('admin/content')->where('tab', 'news')->has('news', 1)->where('counts.news', 1));
        $this->actingAs($admin)->get('/admin/news')->assertRedirect('/admin/content?tab=news');
        $this->actingAs($this->makeUser())->get('/admin/content')->assertForbidden();
        $this->actingAs($this->makeUser())->post('/admin/content/news', ['title' => 'x'])->assertForbidden();
    }
}
